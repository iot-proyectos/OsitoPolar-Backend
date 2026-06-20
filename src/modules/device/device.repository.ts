import { prisma } from '../../config';
import { Device, DeviceStatus } from '@prisma/client';

export class DeviceRepository {
  async findByUserId(userId: string): Promise<Device[]> {
    return prisma.device.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Device | null> {
    return prisma.device.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findBySerialNumber(serialNumber: string): Promise<Device | null> {
    return prisma.device.findUnique({
      where: { serialNumber },
    });
  }

  async findByApiKey(apiKey: string): Promise<Device | null> {
    return prisma.device.findUnique({
      where: { apiKey, deletedAt: null },
    });
  }

    async create(data: {
        name: string;
        serialNumber: string;
        apiKey: string;
        userId: string;
        coordinateX: number;
        coordinateY: number;
    }): Promise<Device> {

        // 1. Buscamos el ID del plano principal (Section) DEL USUARIO ACTUAL
        let primerPlano = await prisma.section.findFirst({
            where: {
                userId: data.userId
            }
        });

        // 2. CREACIÓN BAJO DEMANDA: Si no tiene mapa, le creamos uno automáticamente
        if (!primerPlano) {
            primerPlano = await prisma.section.create({
                data: {
                    name: "Plano Principal",
                    imageUrl: "https://via.placeholder.com/800x600.png?text=Plano+Por+Defecto", // <--- AGREGAMOS EL DATO FALTANTE
                    userId: data.userId
                }
            });
            console.log(`[OsitoPolar] Mapa automático creado para el usuario ${data.userId}`);
        }

        // 3. MAGIA DE PRISMA: Creamos el Equipo y sus relaciones de un solo golpe
        return prisma.device.create({
            data: {
                name: data.name,
                serialNumber: data.serialNumber,
                apiKey: data.apiKey,
                userId: data.userId,

                // --- RELACIONES ANIDADAS ---
                mappings: {
                    create: {
                        x: data.coordinateX,
                        y: data.coordinateY,
                        sectionId: primerPlano.id
                    }
                },
                temperatures: {
                    create: { celsius: 0.0 } // Temperatura inicial de fábrica
                },
                humidities: {
                    create: { percentage: 50.0 } // Humedad inicial de fábrica
                }
            },
        });
    }

  async update(id: string, data: Partial<Pick<Device, 'name' | 'status' | 'lastSeenAt'>>): Promise<Device> {
    return prisma.device.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Device> {
    return prisma.device.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByIdWithLatestReadings(id: string): Promise<{
    device: Device;
    lastTemperature: { celsius: number; createdAt: Date } | null;
    lastHumidity: { percentage: number; createdAt: Date } | null;
  } | null> {
    const device = await prisma.device.findUnique({
      where: { id, deletedAt: null },
    });

    if (!device) return null;

    const [lastTemperature, lastHumidity] = await Promise.all([
      prisma.temperature.findFirst({
        where: { deviceId: id },
        orderBy: { createdAt: 'desc' },
        select: { celsius: true, createdAt: true },
      }),
      prisma.humidity.findFirst({
        where: { deviceId: id },
        orderBy: { createdAt: 'desc' },
        select: { percentage: true, createdAt: true },
      }),
    ]);

    return { device, lastTemperature, lastHumidity };
  }

  async markOfflineDevices(thresholdMinutes: number): Promise<number> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    const result = await prisma.device.updateMany({
      where: {
        status: DeviceStatus.ONLINE,
        deletedAt: null,
        OR: [
          { lastSeenAt: { lt: threshold } },
          { lastSeenAt: null },
        ],
      },
      data: { status: DeviceStatus.OFFLINE },
    });

    return result.count;
  }
}
