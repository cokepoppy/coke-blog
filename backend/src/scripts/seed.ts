import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../entities/User';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    const userRepository = AppDataSource.getRepository(User);

    // Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User();
    admin.username = 'admin';
    admin.email = 'admin@myblog.com'; // Matches design doc
    admin.passwordHash = adminPassword;
    admin.displayName = 'Administrator';
    admin.role = UserRole.ADMIN;
    admin.status = UserStatus.ACTIVE;
    admin.bio = 'System Administrator';

    const existingAdmin = await userRepository.findOneBy({ username: admin.username });
    if (existingAdmin) {
        existingAdmin.email = admin.email;
        existingAdmin.passwordHash = adminPassword;
        existingAdmin.role = UserRole.ADMIN;
        existingAdmin.displayName = admin.displayName;
        await userRepository.save(existingAdmin);
        console.log('✅ Admin user updated (password: admin123)');
    } else {
        await userRepository.save(admin);
        console.log('✅ Admin user created (password: admin123)');
    }

    // Visitor User
    const visitorPassword = await bcrypt.hash('visitor123', 10);
    const visitor = new User();
    visitor.username = 'visitor';
    visitor.email = 'visitor@myblog.com'; // Matches design doc
    visitor.passwordHash = visitorPassword;
    visitor.displayName = 'Visitor';
    visitor.role = UserRole.READER; // Mapping 'visitor' to READER
    visitor.status = UserStatus.ACTIVE;
    visitor.bio = 'Regular Visitor';

    const existingVisitor = await userRepository.findOneBy({ username: visitor.username });
    if (existingVisitor) {
        existingVisitor.email = visitor.email;
        existingVisitor.passwordHash = visitorPassword;
        existingVisitor.role = UserRole.READER;
        existingVisitor.displayName = visitor.displayName;
        await userRepository.save(existingVisitor);
        console.log('✅ Visitor user updated (password: visitor123)');
    } else {
        await userRepository.save(visitor);
        console.log('✅ Visitor user created (password: visitor123)');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
