#!/usr/bin/env node

import 'dotenv/config';
import mongoose from 'mongoose';
import { User, ROLES } from '../models/user.model';
import env from '../config/env';

const seed = async (): Promise<void> => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? 'System Admin';

    if (!email || !password) {
        console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD env vars are required.');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('Error: ADMIN_PASSWORD must be at least 8 characters.');
        process.exit(1);
    }

    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email, deletedAt: null });
    if (existing) {
        console.log(`Admin with email '${email}' already exists. Skipping.`);
        await mongoose.disconnect();
        process.exit(0);
    }

    const admin = new User({
        name,
        email,
        passwordHash: password,
        role: ROLES.ADMIN,
    });

    await admin.save();

    console.log(`✓ Admin user created:`);
    console.log(`  Name:  ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role:  ${admin.role}`);
    console.log(`  ID:    ${admin._id}`);

    await mongoose.disconnect();
    process.exit(0);
};

seed().catch((err: Error) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
