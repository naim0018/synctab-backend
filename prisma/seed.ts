import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';
import * as crypto from 'crypto';

// Password hashing helper for seed database creation
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Setup database connection adapter for the seed script
const dbPath = path.resolve(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const defaultPassword = hashPassword('password123');

  // Delete all existing data to prevent duplicates on re-seed
  await prisma.message.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.task.deleteMany();
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Teammates (Users)
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@skynet.com',
      password: defaultPassword,
      avatar: 'avatar-1',
      status: 'Active',
    },
  });

  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@office.com',
      password: defaultPassword,
      avatar: 'avatar-2',
      status: 'In Meeting',
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@corporate.com',
      password: defaultPassword,
      avatar: 'avatar-3',
      status: 'Away',
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@design.com',
      password: defaultPassword,
      avatar: 'avatar-4',
      status: 'Active',
    },
  });

  console.log('Created teammates.');

  // 2. Create Notes
  // Shared notes
  await prisma.note.create({
    data: {
      title: '📌 Team Standup Meeting Notes',
      content: `### Standup Notes - June 2026\n\n**Focus items for today:**\n- Sarah: Finalize the client dashboard layout.\n- John: Investigate NestJS websocket connection drops.\n- Alice: Style the custom bookmarks section.\n\n*Next meeting tomorrow at 9:30 AM.*`,
      isShared: true,
      userId: sarah.id,
    },
  });

  await prisma.note.create({
    data: {
      title: '🚀 Q3 Launch Checklist',
      content: `### Q3 Deliverables\n\n1. [x] Setup database models\n2. [ ] Write seed scripts\n3. [ ] Implement beautiful UI widgets\n4. [ ] Build Chrome extension manifest V3\n5. [ ] Release beta to core team`,
      isShared: true,
      userId: alice.id,
    },
  });

  // Private note for John
  await prisma.note.create({
    data: {
      title: 'Private: Coffee orders & receipts',
      content: `- Espresso for John\n- Double Macchiato for Sarah\n- Iced Latte for Alice\n- Keep receipts in the office drawer.`,
      isShared: false,
      userId: john.id,
    },
  });

  console.log('Created notes.');

  // 3. Create Bookmarks
  await prisma.bookmark.createMany({
    data: [
      {
        title: 'Office Portal',
        url: 'https://office.com',
        category: 'Work',
        clicks: 14,
        isShared: true,
        userId: sarah.id,
      },
      {
        title: 'Company GitHub',
        url: 'https://github.com',
        category: 'Development',
        clicks: 32,
        isShared: true,
        userId: john.id,
      },
      {
        title: 'Figma Designs',
        url: 'https://figma.com',
        category: 'Design',
        clicks: 25,
        isShared: true,
        userId: alice.id,
      },
      {
        title: 'SyncTab Issues',
        url: 'https://github.com/issues',
        category: 'Development',
        clicks: 8,
        isShared: true,
        userId: jane.id,
      },
      {
        title: 'My Personal Portal',
        url: 'https://news.ycombinator.com',
        category: 'Tech News',
        clicks: 3,
        isShared: false,
        userId: john.id,
      },
    ],
  });

  console.log('Created bookmarks.');

  // 4. Create Tasks
  await prisma.task.create({
    data: {
      title: 'Design sleek glassmorphism UI dashboard',
      description: 'Create the primary dashboard layout with blur effects, vibrant dark/light toggle and custom icons.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      creatorId: sarah.id,
      assigneeId: alice.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Deploy backend API to staging server',
      description: 'Host the NestJS SQLite backend and expose public port with proper SSL.',
      status: 'TODO',
      priority: 'HIGH',
      creatorId: sarah.id,
      assigneeId: john.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Write project README and onboarding documentation',
      description: 'Detailed steps to install and load the extension in developer mode.',
      status: 'TODO',
      priority: 'LOW',
      creatorId: jane.id,
      assigneeId: sarah.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Refactor bookmarks list sorting',
      description: 'Ensure bookmarks are sorted by click count first, then by creation date.',
      status: 'DONE',
      priority: 'MEDIUM',
      creatorId: john.id,
      assigneeId: john.id,
    },
  });

  console.log('Created tasks.');

  // 5. Create Reminders
  await prisma.reminder.createMany({
    data: [
      {
        text: 'Submit weekly timesheet before Friday 5 PM',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        isCompleted: false,
        userId: john.id,
      },
      {
        text: 'Review Alice\'s pull request for widgets',
        dueDate: new Date(new Date().setHours(new Date().getHours() + 4)),
        isCompleted: false,
        userId: john.id,
      },
    ],
  });

  console.log('Created reminders.');

  // 6. Create Messages (Live Chat)
  await prisma.message.create({
    data: {
      text: 'Hey team! Welcome to SyncTab. Feel free to chat and share notes here!',
      userId: sarah.id,
      createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 10)),
    },
  });

  await prisma.message.create({
    data: {
      text: 'Thanks Sarah! The real-time updates are working incredibly fast.',
      userId: john.id,
      createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 8)),
    },
  });

  await prisma.message.create({
    data: {
      text: 'Loving the custom new-tab bookmark categorization!',
      userId: alice.id,
      createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 5)),
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
