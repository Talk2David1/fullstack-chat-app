import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';

// Load environment variables
dotenv.config();

// Sample users data
const users = [
  {
    email: 'alice@example.com',
    fullName: 'Alice Johnson',
    password: 'password123',
    profilePic: 'https://i.pravatar.cc/150?img=1',
  },
  {
    email: 'bob@example.com',
    fullName: 'Bob Smith',
    password: 'password123',
    profilePic: 'https://i.pravatar.cc/150?img=2',
  },
];

// Sample messages data
const messages = [
  {
    text: 'Hey Bob, how are you doing?',
  },
  {
    text: 'Hi Alice! I\'m doing great, thanks for asking. How about you?',
  },
  {
    text: 'I\'m good! Just working on our chat app. What do you think about the new features?',
  },
  {
    text: 'The app looks amazing! I really like the real-time updates and the clean UI.',
  },
  {
    text: 'Thanks! I was thinking of adding file sharing next. What do you think?',
  },
  {
    text: 'That would be awesome! It would make sharing documents much easier.',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Message.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords and create users
    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = await User.create({
        ...user,
        password: hashedPassword,
      });
      createdUsers.push(newUser);
    }
    console.log('Created users:', createdUsers.map(u => u.email).join(', '));

    // Create messages between users
    const [alice, bob] = createdUsers;
    const messagePromises = [];
    
    // Alternate messages between Alice and Bob
    for (let i = 0; i < messages.length; i++) {
      const sender = i % 2 === 0 ? alice : bob;
      const receiver = i % 2 === 0 ? bob : alice;
      
      messagePromises.push(
        Message.create({
          senderId: sender._id,
          receiverId: receiver._id,
          text: messages[i].text,
        })
      );
    }

    await Promise.all(messagePromises);
    console.log(`Created ${messages.length} messages between ${alice.fullName} and ${bob.fullName}`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
