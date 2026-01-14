const connectDB = require('../config/db');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const constants = require('../constants');

async function main() {
    await connectDB();

    console.log('Seeding test data...');

    // Remove existing test users and posts created by this script
    // remove previous test users (case-insensitive)
    await User.deleteMany({ email: { $regex: '^[WL]\\d+@gmail\\.com$', $options: 'i' } });
    console.log('Removed existing test users');

    // Create leaders L1..L20
    const leaderDocs = [];
    for (let i = 1; i <= 20; i++) {
        const email = `L${i}@gmail.com`;
        const hashed = await bcrypt.hash('123456', 10);
        const faiths = Object.values(constants.FAITHS);
        const faith = faiths[i % faiths.length] || faiths[0];
        const user = await User.create({
            name: `Leader ${i}`,
            email,
            password: hashed,
            role: constants.ROLES.LEADER,
            faith,
            bio: `Religious leader ${i}`,
        });
        leaderDocs.push(user);
    }
    console.log('Created leaders:', leaderDocs.length);

    // Create worshipers W1..W20
    const worshiperDocs = [];
    for (let i = 1; i <= 20; i++) {
        const email = `W${i}@gmail.com`;
        const hashed = await bcrypt.hash('123456', 10);
        const faiths = Object.values(constants.FAITHS);
        const faith = faiths[(i + 5) % faiths.length] || faiths[0];
        const user = await User.create({
            name: `Worshiper ${i}`,
            email,
            password: hashed,
            role: constants.ROLES.WORSHIPER,
            faith,
            bio: `Worshiper ${i}`,
        });
        worshiperDocs.push(user);
    }
    console.log('Created worshipers:', worshiperDocs.length);

    // Create some posts for leaders
    const postDocs = [];
    for (const leader of leaderDocs) {
        for (let p = 1; p <= 3; p++) {
            const post = await Post.create({
                author: leader._id,
                title: `Message ${p} from ${leader.name}`,
                text: `This is example post ${p} by ${leader.name}. Be blessed.`,
            });
            postDocs.push(post);
        }
    }
    console.log('Created posts:', postDocs.length);

    // Make worshipers follow 3 random leaders each
    function pickRandom(arr, n) {
        const res = new Set();
        while (res.size < n) {
            const idx = Math.floor(Math.random() * arr.length);
            res.add(arr[idx]._id.toString());
        }
        return Array.from(res).map((id) => new mongoose.Types.ObjectId(id));
    }

    for (const worshiper of worshiperDocs) {
        const followIds = pickRandom(leaderDocs, 3);
        await User.findByIdAndUpdate(worshiper._id, { $addToSet: { following: { $each: followIds } } });
        // add follower to leaders
        for (const lid of followIds) {
            await User.findByIdAndUpdate(lid, { $addToSet: { followers: worshiper._id } });
        }
    }
    console.log('Created follow relationships');

    console.log('Seeding completed');
    await mongoose.connection.close();
    process.exit(0);
}

main().catch((err) => {
    console.error('Seeding failed', err);
    process.exit(1);
});
