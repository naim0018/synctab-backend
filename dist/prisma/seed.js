"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}
const dbPath = path.resolve(__dirname, 'dev.db');
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({
    url: `file:${dbPath}`,
});
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
    const defaultPassword = hashPassword('password123');
    await prisma.message.deleteMany();
    await prisma.reminder.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.task.deleteMany();
    await prisma.note.deleteMany();
    await prisma.user.deleteMany();
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
    await prisma.note.create({
        data: {
            title: 'Private: Coffee orders & receipts',
            content: `- Espresso for John\n- Double Macchiato for Sarah\n- Iced Latte for Alice\n- Keep receipts in the office drawer.`,
            isShared: false,
            userId: john.id,
        },
    });
    console.log('Created notes.');
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
//# sourceMappingURL=seed.js.map