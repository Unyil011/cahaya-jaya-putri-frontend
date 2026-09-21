const formatIndonesianDate = (dateString, includeTime = true) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  if (!includeTime) {
    return `${day} ${month} ${year}`;
  }
  
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
};

export default formatIndonesianDate;
