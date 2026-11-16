// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MineAIToken
 * @notice The $MINEAI utility token.
 *
 * Supply is fixed at genesis: the constructor mints the entire 1,000,000,000
 * allocation to the treasury and no mint function exists afterwards. The only
 * supply change the contract can make is a burn, so the circulating float can
 * shrink but never grow.
 *
 * Staking pools hold principal in this contract. Yield is not minted: the owner
 * funds a pool with tokens that already exist, and `fundRewards` distributes
 * them pro rata across the pool's stakers through an accumulator. That keeps the
 * fixed-supply promise true while still paying a real, funded yield.
 */
contract MineAIToken is ERC20, ERC20Burnable, ERC20Permit, Ownable, ReentrancyGuard {
    /// @notice The entire supply, minted once to the treasury.
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;

    uint256 private constant BPS = 10_000;
    uint256 private constant ACC_PRECISION = 1e18;
    uint256 private constant MAX_POOLS = 20;

    struct Pool {
        string name;
        uint32 aprBps;
        uint32 lockDays;
        uint256 totalStaked;
        uint256 accRewardPerShare;
        uint256 rewardBalance;
        bool active;
    }

    struct Stake {
        uint256 amount;
        uint256 rewardDebt;
        uint64 since;
        uint64 unlockAt;
    }

    Pool[] public pools;
    mapping(uint256 => mapping(address => Stake)) public stakes;

    event PoolCreated(uint256 indexed poolId, string name, uint32 aprBps, uint32 lockDays);
    event PoolUpdated(uint256 indexed poolId, bool active, uint32 aprBps);
    event Staked(uint256 indexed poolId, address indexed account, uint256 amount);
    event Unstaked(uint256 indexed poolId, address indexed account, uint256 amount);
    event RewardsFunded(uint256 indexed poolId, address indexed funder, uint256 amount);
    event RewardsClaimed(uint256 indexed poolId, address indexed account, uint256 amount);

    error PoolUnknown(uint256 poolId);
    error PoolInactive(uint256 poolId);
    error PoolLimitReached();
    error ZeroAmount();
    error StillLocked(uint256 unlockAt);
    error InsufficientStake(uint256 requested, uint256 available);
    error NoStakers(uint256 poolId);

    constructor(address treasury) ERC20("Mine AI", "MINEAI") ERC20Permit("Mine AI") Ownable(msg.sender) {
        if (treasury == address(0)) revert ZeroAmount();
        _mint(treasury, MAX_SUPPLY);
    }

    /* ------------------------------------------------------------------ */
    /*                               Staking                              */
    /* ------------------------------------------------------------------ */

    function poolCount() external view returns (uint256) {
        return pools.length;
    }

    /// @notice Adds a staking pool. `aprBps` is the advertised rate; the funded
    ///         reward flow is what actually determines the realised yield.
    function createPool(
        string calldata name,
        uint32 aprBps,
        uint32 lockDays
    ) external onlyOwner returns (uint256 poolId) {
        if (pools.length >= MAX_POOLS) revert PoolLimitReached();

        poolId = pools.length;
        pools.push(
            Pool({
                name: name,
                aprBps: aprBps,
                lockDays: lockDays,
                totalStaked: 0,
                accRewardPerShare: 0,
                rewardBalance: 0,
                active: true
            })
        );

        emit PoolCreated(poolId, name, aprBps, lockDays);
    }

    function setPoolActive(uint256 poolId, bool active) external onlyOwner {
        Pool storage pool = _pool(poolId);
        pool.active = active;
        emit PoolUpdated(poolId, active, pool.aprBps);
    }

    function setPoolApr(uint256 poolId, uint32 aprBps) external onlyOwner {
        Pool storage pool = _pool(poolId);
        pool.aprBps = aprBps;
        emit PoolUpdated(poolId, pool.active, aprBps);
    }

    /// @notice Moves existing tokens into a pool's reward reserve and raises the
    ///         accumulator. Caller must have approved this contract first.
    function fundRewards(uint256 poolId, uint256 amount) external nonReentrant {
        Pool storage pool = _pool(poolId);
        if (!pool.active) revert PoolInactive(poolId);
        if (amount == 0) revert ZeroAmount();
        if (pool.totalStaked == 0) revert NoStakers(poolId);

        // Pull the funded amount from the caller; this contract then holds it
        // as the pool's reward reserve.
        transferFrom(msg.sender, address(this), amount);

        pool.rewardBalance += amount;
        pool.accRewardPerShare += (amount * ACC_PRECISION) / pool.totalStaked;

        emit RewardsFunded(poolId, msg.sender, amount);
    }

    function stake(uint256 poolId, uint256 amount) external nonReentrant {
        Pool storage pool = _pool(poolId);
        if (!pool.active) revert PoolInactive(poolId);
        if (amount == 0) revert ZeroAmount();

        _claim(poolId, msg.sender);

        Stake storage record = stakes[poolId][msg.sender];
        transferFrom(msg.sender, address(this), amount);

        record.amount += amount;
        record.rewardDebt = (record.amount * pool.accRewardPerShare) / ACC_PRECISION;
        record.since = uint64(block.timestamp);
        record.unlockAt = uint64(block.timestamp + uint256(pool.lockDays) * 1 days);

        pool.totalStaked += amount;

        emit Staked(poolId, msg.sender, amount);
    }

    function unstake(uint256 poolId, uint256 amount) external nonReentrant {
        Pool storage pool = _pool(poolId);
        if (amount == 0) revert ZeroAmount();

        Stake storage record = stakes[poolId][msg.sender];
        if (amount > record.amount) revert InsufficientStake(amount, record.amount);
        if (block.timestamp < record.unlockAt) revert StillLocked(record.unlockAt);

        _claim(poolId, msg.sender);

        record.amount -= amount;
        record.rewardDebt = (record.amount * pool.accRewardPerShare) / ACC_PRECISION;
        if (record.amount == 0) {
            delete stakes[poolId][msg.sender];
        }

        pool.totalStaked -= amount;
        _transfer(address(this), msg.sender, amount);

        emit Unstaked(poolId, msg.sender, amount);
    }

    function claimRewards(uint256 poolId) external nonReentrant returns (uint256 reward) {
        _pool(poolId);
        reward = _claim(poolId, msg.sender);
    }

    function pendingRewards(uint256 poolId, address account) external view returns (uint256) {
        Pool storage pool = pools[poolId];
        Stake storage record = stakes[poolId][account];
        if (record.amount == 0) return 0;

        uint256 accrued = (record.amount * pool.accRewardPerShare) / ACC_PRECISION;
        if (accrued <= record.rewardDebt) return 0;
        return accrued - record.rewardDebt;
    }

    /* ------------------------------------------------------------------ */
    /*                              Internals                             */
    /* ------------------------------------------------------------------ */

    function _claim(uint256 poolId, address account) private returns (uint256 reward) {
        Pool storage pool = pools[poolId];
        Stake storage record = stakes[poolId][account];
        if (record.amount == 0) return 0;

        uint256 accrued = (record.amount * pool.accRewardPerShare) / ACC_PRECISION;
        if (accrued <= record.rewardDebt) return 0;

        reward = accrued - record.rewardDebt;
        // Rounding across stakers can leave the accumulator a wei short; never
        // pay more than the pool actually holds.
        if (reward > pool.rewardBalance) reward = pool.rewardBalance;

        record.rewardDebt = accrued;
        pool.rewardBalance -= reward;
        _transfer(address(this), account, reward);

        emit RewardsClaimed(poolId, account, reward);
    }

    function _pool(uint256 poolId) private view returns (Pool storage pool) {
        if (poolId >= pools.length) revert PoolUnknown(poolId);
        return pools[poolId];
    }
}
