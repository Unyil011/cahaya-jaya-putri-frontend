import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');

const replacement = `const handleUploadPaymentProof = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const toastId = toast.loading('Mengunggah bukti pembayaran...');
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = \`\${selectedOrderDetails.id}-\${Math.random().toString(36).substring(2)}.\${fileExt}\`;
      const filePath = \`public/\${fileName}\`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment_proofs')
        .getPublicUrl(filePath);

      // Update order in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_proof_url: publicUrl,
          payment_status: 'Menunggu Konfirmasi'
        })
        .eq('id', selectedOrderDetails.id);

      if (updateError) throw updateError;

      // Update local state
      const updatedOrder = { ...selectedOrderDetails, paymentProofUrl: publicUrl, paymentStatus: 'Menunggu Konfirmasi' };
      setSelectedOrderDetails(updatedOrder);
      setOrders(orders.map(o => o.id === updatedOrder.id ? { ...o, paymentStatus: 'Menunggu Konfirmasi' } : o));

      toast.success('Bukti pembayaran berhasil diunggah!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunggah bukti pembayaran.', { id: toastId });
    }
  };`;

code = code.replace(/const handleUploadPaymentProof = async[\s\S]*?toast\.error\('Fitur unggah bukti pembayaran sedang dalam perbaikan[\s\S]*?\}\s*\};/, replacement);

fs.writeFileSync('src/components/client/ClientHistory.jsx', code);
console.log('Fixed ClientHistory upload');
