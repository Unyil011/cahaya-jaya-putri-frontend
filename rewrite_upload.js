import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');

// 1. Add state for preview
code = code.replace(
  "const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);",
  "const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);\n  const [previewFile, setPreviewFile] = useState(null);\n  const [previewUrl, setPreviewUrl] = useState(null);"
);

// 2. Modify handleUploadPaymentProof
const oldUploadFunction = `  const handleUploadPaymentProof = async (e) => {
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

const newUploadFunction = `  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const submitPaymentProof = async () => {
    if (!previewFile) return;
    const toastId = toast.loading('Mengunggah bukti pembayaran...');
    try {
      // Create Base64 string directly to avoid bucket creation issues
      const reader = new FileReader();
      reader.readAsDataURL(previewFile);
      reader.onload = async () => {
        const base64String = reader.result;
        
        // Update order in database directly with base64
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            payment_proof_url: base64String,
            payment_status: 'Menunggu Konfirmasi'
          })
          .eq('id', selectedOrderDetails.id);

        if (updateError) throw updateError;

        // Update local state
        const updatedOrder = { ...selectedOrderDetails, paymentProofUrl: base64String, paymentStatus: 'Menunggu Konfirmasi' };
        setSelectedOrderDetails(updatedOrder);
        setOrders(orders.map(o => o.id === updatedOrder.id ? { ...o, paymentProofUrl: base64String, paymentStatus: 'Menunggu Konfirmasi' } : o));
        
        setPreviewFile(null);
        setPreviewUrl(null);
        toast.success('Bukti pembayaran berhasil diunggah!', { id: toastId });
      };
      reader.onerror = (error) => { throw error; };
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunggah bukti pembayaran.', { id: toastId });
    }
  };`;

code = code.replace(oldUploadFunction, newUploadFunction);

// 3. Replace Bukti Pembayaran UI
// Find the exact UI block
const oldUIBlock = `                  {selectedOrderDetails.paymentProofUrl ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-400">Bukti Telah Diunggah</p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          {selectedOrderDetails.paymentStatus === 'Lunas' ? 'Pembayaran telah dikonfirmasi Lunas oleh Admin.' : 'Menunggu verifikasi Admin.'}
                        </p>
                      </div>
                      <a 
                        href={selectedOrderDetails.paymentProofUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
                      >
                        Lihat Bukti
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Silakan unggah bukti transfer/pembayaran agar admin dapat mengonfirmasi pesanan menjadi Lunas.
                      </p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleUploadPaymentProof}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-mbg-blue-50 file:text-mbg-blue-700
                          hover:file:bg-mbg-blue-100
                          dark:file:bg-mbg-blue-900/30 dark:file:text-mbg-blue-400
                          cursor-pointer"
                      />
                    </div>
                  )}`;

const newUIBlock = `                  {previewUrl ? (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative group">
                        <img src={previewUrl} alt="Preview Bukti" className="w-full h-auto max-h-64 object-contain bg-gray-50 dark:bg-gray-800" />
                        <button 
                          onClick={() => { setPreviewFile(null); setPreviewUrl(null); }}
                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={submitPaymentProof}
                        className="w-full py-3 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors"
                      >
                        Kirim Bukti Pembayaran
                      </button>
                    </div>
                  ) : selectedOrderDetails.paymentProofUrl ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-400">Bukti Telah Diunggah</p>
                          <p className="text-sm text-green-600 dark:text-green-500">
                            {selectedOrderDetails.paymentStatus === 'Lunas' ? 'Pembayaran telah dikonfirmasi Lunas oleh Admin.' : 'Menunggu verifikasi Admin.'}
                          </p>
                        </div>
                        <a 
                          href={selectedOrderDetails.paymentProofUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors whitespace-nowrap"
                        >
                          Lihat Bukti
                        </a>
                      </div>
                      {selectedOrderDetails.paymentStatus !== 'Lunas' && (
                        <div className="text-right">
                          <label className="cursor-pointer text-sm text-mbg-blue-600 hover:text-mbg-blue-700 dark:text-mbg-blue-400 hover:underline">
                            Ganti Bukti Pembayaran?
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Silakan unggah bukti transfer/pembayaran agar admin dapat mengonfirmasi pesanan menjadi Lunas.
                      </p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-mbg-blue-50 file:text-mbg-blue-700
                          hover:file:bg-mbg-blue-100
                          dark:file:bg-mbg-blue-900/30 dark:file:text-mbg-blue-400
                          cursor-pointer"
                      />
                    </div>
                  )}`;

code = code.replace(oldUIBlock, newUIBlock);
fs.writeFileSync('src/components/client/ClientHistory.jsx', code);
console.log("Updated ClientHistory with preview and Base64 upload logic");
