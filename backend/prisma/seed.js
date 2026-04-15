const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  await prisma.berita.deleteMany();
  await prisma.jadwal.deleteMany();
  await prisma.kalender.deleteMany();
  await prisma.notifikasi.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: adminPassword,
      nama: 'admin',
      role: 'admin',
      foto_profil: '/uploads/avatar-admin.jpg',
    },
  });
  console.log('✅ Admin created:', admin.nama);

  // Create Staff User
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.create({
    data: {
      email: 'staff@gmail.com',
      password: staffPassword,
      nama: 'staff',
      role: 'staff',
      foto_profil: '/uploads/avatar-staff.jpg',
    },
  });
  console.log('✅ Staff created:', staff.nama);

  // Create Regular User
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      password: userPassword,
      nama: 'user',
      role: 'user',
      foto_profil: '/uploads/avatar-user.jpg',
    },
  });
  console.log('✅ User created:', user.nama);

  // Create Sample News (Berita)
  const berita1 = await prisma.berita.create({
    data: {
      judul: 'Peluncuran Tim Riset Terbaru STIESNU',
      link_url: 'https://stiesnu.ac.id/berita/tim-riset-2024',
      gambar: '/uploads/berita-1.jpg',
    },
  });

  const berita2 = await prisma.berita.create({
    data: {
      judul: 'Seminar Nasional Ekonomi Syariah 2024',
      link_url: 'https://stiesnu.ac.id/berita/seminar-ekonomi-2024',
      gambar: '/uploads/berita-2.jpg',
    },
  });

  console.log('✅ Sample news created');

  // Create Sample Kalender (Event Kampus dari Staff/Admin)
  const kalender1 = await prisma.kalender.create({
    data: {
      nama_event: 'Apel Pagi Rutin',
      deskripsi_event: 'Upacara apel pagi rutin setiap hari Senin untuk seluruh civitas akademik.',
      waktu_event: new Date(new Date().setDate(new Date().getDate() + 1)),
      warna_event: '#22c55e', // Green
    },
  });

  const kalender2 = await prisma.kalender.create({
    data: {
      nama_event: 'Pengumuman Hasil Ujian Akhir Semester',
      deskripsi_event: 'Pengumuman hasil ujian akhir semester ganjil tahun akademik 2023/2024.',
      waktu_event: new Date(new Date().setDate(new Date().getDate() + 7)),
      warna_event: '#3b82f6', // Blue
    },
  });

  // Buat sample event kalender
  const baseHolidays = [
    { nama_event: 'Tahun Baru Masehi', waktu_event: new Date('2026-01-01T00:00:00.000Z'), deskripsi_event: 'Libur Nasional', warna_event: '#ef4444' },
    { nama_event: 'Hari Raya Idul Fitri', waktu_event: new Date('2026-03-20T00:00:00.000Z'), deskripsi_event: 'Libur Nasional', warna_event: '#ef4444' },
    { nama_event: 'Hari Kemerdekaan RI', waktu_event: new Date('2026-08-17T00:00:00.000Z'), deskripsi_event: 'Hari Kemerdekaan Indonesia', warna_event: '#ef4444' }
  ];

  await prisma.kalender.createMany({
    data: [
      ...baseHolidays,
      {
        nama_event: 'Ujian Akhir Semester',
        waktu_event: new Date('2026-12-15T08:00:00Z'),
        deskripsi_event: 'UAS Ganjil TA 2026/2027',
        warna_event: '#3B82F6', // Blue
      },
      {
        nama_event: 'Wisuda Angkatan X',
        waktu_event: new Date('2026-11-20T09:00:00Z'),
        deskripsi_event: 'Upacara wisuda',
        warna_event: '#EAB308', // Yellow
      },
    ],
  });

  console.log('✅ Sample kalender created');

  // Create Sample Jadwal (Personal Reminders)
  const jadwal1 = await prisma.jadwal.create({
    data: {
      nama_kegiatan: 'Deadline Tugas Mata Kuliah',
      deskripsi_kegiatan: 'Deadline submission tugas untuk mata kuliah Ekonomi Mikro',
      tanggal_kegiatan: new Date(new Date().setDate(new Date().getDate() + 3)),
      pengulangan: 'sekali',
      pengingat: 'satu_jam',
      user_id: user.id_user,
    },
  });

  console.log('✅ Sample jadwal created');

  // Create Sample Notifications
  await prisma.notifikasi.create({
    data: {
      judul: 'Berita Baru: Peluncuran Tim Riset',
    },
  });

  await prisma.notifikasi.create({
    data: {
      judul: 'Jadwal Mendatang: Apel Pagi Rutin akan dilaksanakan segera',
    },
  });

  console.log('✅ Sample notifications created');

  console.log('✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
