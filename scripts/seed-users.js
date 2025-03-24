const mongoose = require('mongoose');
const userController = require('../controllers/users');
const roleSchema = require('../models/roles');

// Hàm tạo role nếu chưa tồn tại
async function createRoleIfNotExists(roleName, description) {
    const existingRole = await roleSchema.findOne({ roleName });
    if (!existingRole) {
        console.log(`Tạo role mới: ${roleName}`);
        await roleSchema.create({
            roleName,
            description: description || `Role ${roleName}`
        });
    } else {
        console.log(`Role ${roleName} đã tồn tại`);
    }
}

// Hàm khởi tạo user
async function createUserWithRole(username, password, email, fullName, avatarUrl, roleName) {
    try {
        const user = await userController.createUser(
            username,
            password,
            email,
            roleName
        );
        
        // Cập nhật thêm thông tin
        user.fullName = fullName;
        user.avatarUrl = avatarUrl;
        await user.save();
        
        console.log(`Đã tạo thành công user: ${username} với role: ${roleName}`);
        return user;
    } catch (error) {
        console.error(`Lỗi khi tạo user ${username}:`, error.message);
    }
}

// Kết nối đến database
mongoose.connect("mongodb://localhost:27017/C2")
    .then(async () => {
        console.log("Kết nối thành công đến database");
        
        try {
            // 1. Tạo các role nếu chưa tồn tại
            await createRoleIfNotExists('admin', 'Quản trị viên hệ thống');
            await createRoleIfNotExists('mod', 'Người kiểm duyệt');
            await createRoleIfNotExists('user', 'Người dùng thông thường');
            
            // 2. Tạo các user với các role tương ứng
            await createUserWithRole(
                'admin123', 
                'Admin@123', 
                'admin@example.com',
                'Quản Trị Viên',
                'https://example.com/admin.jpg',
                'admin'
            );
            
            await createUserWithRole(
                'moderator123', 
                'Mod@123', 
                'mod@example.com',
                'Kiểm Duyệt Viên',
                'https://example.com/mod.jpg',
                'mod'
            );
            
            await createUserWithRole(
                'user123', 
                'User@123', 
                'user@example.com',
                'Người Dùng',
                'https://example.com/user.jpg',
                'user'
            );
            
            console.log('Đã hoàn thành việc tạo users');
            process.exit(0);
        } catch (error) {
            console.error('Đã xảy ra lỗi:', error);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Lỗi kết nối đến database:', err);
        process.exit(1);
    });
