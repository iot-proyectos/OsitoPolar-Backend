import { PrismaClient, Role, DeviceStatus, SubType, MetricType, AlertType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  // ============================================
  // USERS
  // ============================================
  const adminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  const demoPassword = await bcrypt.hash('Demo123!', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ositopolar.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Admin OsitoPolar',
      email: 'admin@ositopolar.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@ositopolar.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Usuario Demo',
      email: 'demo@ositopolar.com',
      password: demoPassword,
      role: Role.USER,
    },
  });
  console.log(`✅ Demo user: ${demo.email}`);

  // ============================================
  // DEVICES
  // ============================================
  const device1ApiKey = uuidv4();
  const device2ApiKey = uuidv4();

  const device1 = await prisma.device.upsert({
    where: { serialNumber: 'ESP32-001-COCINA' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Refrigerador Cocina',
      serialNumber: 'ESP32-001-COCINA',
      apiKey: device1ApiKey,
      status: DeviceStatus.ONLINE,
      lastSeenAt: new Date(),
      userId: demo.id,
    },
  });
  console.log(`✅ Device 1: ${device1.name} (API Key: ${device1ApiKey})`);

  const device2 = await prisma.device.upsert({
    where: { serialNumber: 'ESP32-002-ALMACEN' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Cámara Fría Almacén',
      serialNumber: 'ESP32-002-ALMACEN',
      apiKey: device2ApiKey,
      status: DeviceStatus.ONLINE,
      lastSeenAt: new Date(),
      userId: demo.id,
    },
  });
  console.log(`✅ Device 2: ${device2.name} (API Key: ${device2ApiKey})`);

  // ============================================
  // SUBSCRIPTION
  // ============================================
  await prisma.subscription.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      type: SubType.RENTING,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Subscription created for demo user');

  // ============================================
  // SECTION & MAPPINGS
  // ============================================
  const section = await prisma.section.create({
    data: {
      id: uuidv4(),
      name: 'Planta Baja - Cocina y Almacén',
      imageUrl: '/uploads/sections/placeholder-floor-plan.png',
      userId: demo.id,
    },
  });
  console.log(`✅ Section: ${section.name}`);

  await prisma.mapping.createMany({
    data: [
      {
        id: uuidv4(),
        x: 25.5,
        y: 40.2,
        sectionId: section.id,
        deviceId: device1.id,
      },
      {
        id: uuidv4(),
        x: 72.8,
        y: 65.1,
        sectionId: section.id,
        deviceId: device2.id,
      },
    ],
  });
  console.log('✅ Mappings created');

  // ============================================
  // TEMPERATURE & HUMIDITY READINGS (50 per device, last 24h)
  // ============================================
  const now = Date.now();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const intervalMs = twentyFourHoursMs / 50;

  const tempReadings: {
    id: string;
    celsius: number;
    deviceId: string;
    createdAt: Date;
  }[] = [];

  const humidityReadings: {
    id: string;
    percentage: number;
    deviceId: string;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now - twentyFourHoursMs + i * intervalMs);

    // Device 1: Refrigerator — temp around 4-6°C, humidity 40-55%
    tempReadings.push({
      id: uuidv4(),
      celsius: parseFloat((4 + Math.random() * 2 + Math.sin(i / 5) * 1.5).toFixed(1)),
      deviceId: device1.id,
      createdAt: timestamp,
    });

    humidityReadings.push({
      id: uuidv4(),
      percentage: parseFloat((45 + Math.random() * 10 + Math.cos(i / 4) * 5).toFixed(1)),
      deviceId: device1.id,
      createdAt: timestamp,
    });

    // Device 2: Cold room — temp around -2 to 2°C, humidity 30-45%
    tempReadings.push({
      id: uuidv4(),
      celsius: parseFloat((-2 + Math.random() * 4 + Math.sin(i / 7) * 1).toFixed(1)),
      deviceId: device2.id,
      createdAt: timestamp,
    });

    humidityReadings.push({
      id: uuidv4(),
      percentage: parseFloat((35 + Math.random() * 10 + Math.cos(i / 6) * 3).toFixed(1)),
      deviceId: device2.id,
      createdAt: timestamp,
    });
  }

  await prisma.temperature.createMany({ data: tempReadings });
  await prisma.humidity.createMany({ data: humidityReadings });
  console.log(`✅ Created ${tempReadings.length} temperature readings`);
  console.log(`✅ Created ${humidityReadings.length} humidity readings`);

  // ============================================
  // USER METRICS (Thresholds)
  // ============================================
  await prisma.userMetrics.createMany({
    data: [
      {
        id: uuidv4(),
        userId: demo.id,
        deviceId: device1.id,
        inferior: 2,
        superior: 8,
        metricType: MetricType.TEMPERATURE,
      },
      {
        id: uuidv4(),
        userId: demo.id,
        deviceId: device1.id,
        inferior: 30,
        superior: 60,
        metricType: MetricType.HUMIDITY,
      },
      {
        id: uuidv4(),
        userId: demo.id,
        deviceId: device2.id,
        inferior: -5,
        superior: 3,
        metricType: MetricType.TEMPERATURE,
      },
      {
        id: uuidv4(),
        userId: demo.id,
        deviceId: device2.id,
        inferior: 25,
        superior: 50,
        metricType: MetricType.HUMIDITY,
      },
    ],
  });
  console.log('✅ User metrics (thresholds) created');

  // ============================================
  // SAMPLE ALERTS
  // ============================================
  await prisma.alert.createMany({
    data: [
      {
        id: uuidv4(),
        type: AlertType.TEMP_HIGH,
        message: `Temperatura de 'Refrigerador Cocina' superó el máximo (8°C): 9.5°C`,
        value: 9.5,
        threshold: 8,
        isRead: false,
        userId: demo.id,
        deviceId: device1.id,
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        type: AlertType.TEMP_LOW,
        message: `Temperatura de 'Cámara Fría Almacén' bajó del mínimo (-5°C): -6.2°C`,
        value: -6.2,
        threshold: -5,
        isRead: false,
        userId: demo.id,
        deviceId: device2.id,
        createdAt: new Date(now - 1 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        type: AlertType.HUMIDITY_HIGH,
        message: `Humedad de 'Refrigerador Cocina' superó el máximo (60%): 65.3%`,
        value: 65.3,
        threshold: 60,
        isRead: true,
        userId: demo.id,
        deviceId: device1.id,
        createdAt: new Date(now - 5 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        type: AlertType.HUMIDITY_LOW,
        message: `Humedad de 'Cámara Fría Almacén' bajó del mínimo (25%): 22.1%`,
        value: 22.1,
        threshold: 25,
        isRead: true,
        userId: demo.id,
        deviceId: device2.id,
        createdAt: new Date(now - 8 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        type: AlertType.DEVICE_OFFLINE,
        message: `Dispositivo 'Cámara Fría Almacén' está offline`,
        value: 0,
        threshold: 0,
        isRead: true,
        userId: demo.id,
        deviceId: device2.id,
        createdAt: new Date(now - 12 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Sample alerts created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin: admin@ositopolar.com / Admin123!');
  console.log('   Demo:  demo@ositopolar.com  / Demo123!');
  console.log(`\n🔑 Device API Keys (for ESP32 X-Device-Key header):`);
  console.log(`   Device 1 (${device1.name}): ${device1ApiKey}`);
  console.log(`   Device 2 (${device2.name}): ${device2ApiKey}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
