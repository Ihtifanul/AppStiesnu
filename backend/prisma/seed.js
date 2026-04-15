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
      judul: 'Hadiri Dies Natalis X STIESNU, Kanwil Kemenag Dukung STIESNU Menuju Level Puncak',
      link_url: 'https://stiesnu-bengkulu.ac.id/hadiri-dies-natalis-x-stiesnu-kanwil-kemenag-dukung-stiesnu-menuju-level-puncak',
      gambar: 'https://stiesnu-bengkulu.ac.id/wp-content/uploads/Screenshot_209.png',
    },
  });

  const berita2 = await prisma.berita.create({
    data: {
      judul: 'Keluarga Besar STIESNU Bengkulu Ucapkan Selamat atas Pelantikan Prof. Dr. H. Khairuddin Wahid, MA sebagai Rektor UINFAS Bengkulu',
      link_url: 'https://stiesnu-bengkulu.ac.id/keluarga-besar-stiesnu-bengkulu-ucapkan-selamat-atas-pelantikan-prof-dr-h-khairuddin-wahid-ma-sebagai-rektor-uinfas-bengkulu',
      gambar: 'https://stiesnu-bengkulu.ac.id/wp-content/uploads/wordpress-thumbnail-9-1080x628.jpg',
    },
  });

  const berita3 = await prisma.berita.create({
    data: {
      judul: 'Keluarga Besar STIESNU Bengkulu Ucapkan Selamat atas Pelantikan Prof. Dr. H. Khairuddin Wahid, MA sebagai Rektor UINFAS BengkuluRamadhan Penuh Berkah: STIESNU Bengkulu Resmi Buka Prodi Pendidikan Guru Madrasah Ibtidaiyah (PGMI)',
      link_url: 'https://stiesnu-bengkulu.ac.id/ramadhan-penuh-berkah-stiesnu-bengkulu-resmi-buka-prodi-pendidikan-guru-madrasah-ibtidaiyah-pgmi',
      gambar: 'https://stiesnu-bengkulu.ac.id/wp-content/uploads/Screenshot_235.png',
    },
  });

  console.log('✅ Sample news created');
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
