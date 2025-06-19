import role from "../models/role.js";
import user from "../models/user.js";
import UserProfile from "../models/userprofile.js";
import userRole from "../models/userRole.js";




user.hasOne(UserProfile, {
    foreignKey: 'user_id',
    as: 'user_profile' // Alias for the association
});
UserProfile.belongsTo(user, {
    foreignKey: 'user_id',
    as: 'user' // Alias for the association
});

user.belongsToMany(role, {
    through: userRole,         // Join table
    foreignKey: 'user_id',     // Field in userRole
    otherKey: 'role_id',
    as: 'roles',               // user.getRoles()
});

role.belongsToMany(user, {
    through: userRole,
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users',               // role.getUsers()
});