// Daftar Hari Libur Nasional (Tanggal Merah) Indonesia untuk referensi di Kalender.
// Gunakan format "YYYY-MM-DD".
export const publicHolidays = [
  // --- 2026 ---
  '2026-01-01', // Tahun Baru Masehi
  '2026-02-17', // Isra Mikraj
  '2026-02-19', // Tahun Baru Imlek
  '2026-03-20', // Hari Raya Nyepi
  '2026-03-22', // Wafat Isa Al Masih
  '2026-03-23', // Paskah
  '2026-04-10', // Idul Fitri (Hari ke-1)
  '2026-04-11', // Idul Fitri (Hari ke-2)
  '2026-05-01', // Hari Buruh
  '2026-05-14', // Kenaikan Isa Al Masih
  '2026-05-31', // Hari Raya Waisak
  '2026-06-01', // Hari Lahir Pancasila
  '2026-06-17', // Idul Adha
  '2026-07-19', // Tahun Baru Islam
  '2026-08-17', // Kemerdekaan RI
  '2026-09-27', // Maulid Nabi Muhammad
  '2026-12-25', // Hari Raya Natal

  // --- 2027 ---
  '2027-01-01', // Tahun Baru Masehi
  '2027-02-06', // Isra Mikraj
  '2027-02-09', // Tahun Baru Imlek
  '2027-03-09', // Hari Raya Nyepi
  '2027-03-26', // Wafat Isa Al Masih
  '2027-03-31', // Idul Fitri (Hari ke-1)
  '2027-04-01', // Idul Fitri (Hari ke-2)
  '2027-05-01', // Hari Buruh
  '2027-05-06', // Kenaikan Isa Al Masih
  '2027-05-20', // Hari Raya Waisak
  '2027-06-01', // Hari Lahir Pancasila
  '2027-06-05', // Idul Adha
  '2027-07-06', // Tahun Baru Islam
  '2027-08-17', // Kemerdekaan RI
  '2027-09-15', // Maulid Nabi Muhammad
  '2027-12-25', // Hari Raya Natal
];

/**
 * Mengecek apakah Object Date merupakan Hari Libur Nasional 
 */
export const isPublicHoliday = (dateObj) => {
  if (!dateObj) return false;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  return publicHolidays.includes(dateString);
};
