import fs from 'fs';
let code = fs.readFileSync('src/components/client/ClientHistory.jsx', 'utf8');

// 1. Add isUploading state
code = code.replace(
  "const [previewUrl, setPreviewUrl] = useState(null);",
  "const [previewUrl, setPreviewUrl] = useState(null);\n  const [isUploading, setIsUploading] = useState(false);"
);

// 2. Replace submitPaymentProof with a properly compressed version
const oldSubmit = `  const submitPaymentProof = async () => {
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

const newSubmit = `  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const submitPaymentProof = async () => {
    if (!previewFile) return;
    setIsUploading(true);
    const toastId = toast.loading('Mengunggah bukti pembayaran...');
    try {
      // Compress image before uploading to prevent payload too large errors
      const base64String = await compressImage(previewFile);
      
      // Update order in database directly with compressed base64
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
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunggah bukti pembayaran.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };`;

code = code.replace(oldSubmit, newSubmit);

// 3. Update the Kirim button and X button to disable during upload
const oldKirimBtn = `<button 
                        onClick={submitPaymentProof}
                        className="w-full py-3 bg-mbg-blue-600 hover:bg-mbg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors"
                      >
                        Kirim Bukti Pembayaran
                      </button>`;

const newKirimBtn = `<button 
                        onClick={submitPaymentProof}
                        disabled={isUploading}
                        className={\`w-full py-3 \${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-mbg-blue-600 hover:bg-mbg-blue-700'} text-white rounded-xl font-medium shadow-md transition-colors\`}
                      >
                        {isUploading ? 'Sedang Mengunggah...' : 'Kirim Bukti Pembayaran'}
                      </button>`;

code = code.replace(oldKirimBtn, newKirimBtn);

const oldXBtn = `<button 
                          onClick={() => { setPreviewFile(null); setPreviewUrl(null); }}
                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>`;

const newXBtn = `<button 
                          onClick={() => { setPreviewFile(null); setPreviewUrl(null); }}
                          disabled={isUploading}
                          className={\`absolute top-2 right-2 p-2 \${isUploading ? 'bg-gray-400' : 'bg-red-600 hover:opacity-100'} text-white rounded-full opacity-80 transition-opacity\`}
                        >
                          <X className="w-4 h-4" />
                        </button>`;

code = code.replace(oldXBtn, newXBtn);

fs.writeFileSync('src/components/client/ClientHistory.jsx', code);
console.log("Updated ClientHistory with image compression and upload state");
