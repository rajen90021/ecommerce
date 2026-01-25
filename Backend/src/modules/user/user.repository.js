import User from './user.model.js';
import Role from './role.model.js';
import Address from './address.model.js';

class UserRepository {
    async create(userData, transaction = null) {
        return await User.create(userData, { transaction });
    }

    async createAddress(addressData, transaction = null) {
        return await Address.create(addressData, { transaction });
    }

    async findByEmail(email, includeProfile = false, includeRoles = false, includeAddresses = false) {
        const include = [];
        if (includeRoles) include.push({
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['role_name']
        });
        if (includeAddresses) include.push({ model: Address, as: 'addresses' });

        return await User.findOne({ where: { email }, include });
    }

    async findByPhone(phone, includeRoles = false, includeAddresses = false) {
        const include = [];
        if (includeRoles) include.push({
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['role_name']
        });
        if (includeAddresses) include.push({ model: Address, as: 'addresses' });

        return await User.findOne({ where: { phone }, include });
    }

    async findById(id, includeProfile = false, includeRoles = false, includeAddresses = false) {
        const include = [];
        if (includeRoles) include.push({
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['role_name']
        });
        if (includeAddresses) include.push({ model: Address, as: 'addresses' });

        return await User.findByPk(id, { include });
    }

    async findRoleByName(roleName) {
        return await Role.findOne({ where: { role_name: roleName } });
    }

    async createRole(roleData, transaction = null) {
        return await Role.create(roleData, { transaction });
    }

    async addRoleToUser(user, role, transaction = null) {
        return await user.addRole(role, { transaction });
    }

    async saveUser(user) {
        return await user.save();
    }
}

export default new UserRepository();
