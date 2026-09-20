let barang = JSON.parse(localStorage.getItem("barang")) || [];
let keranjang = [];
let riwayatPenjualan = JSON.parse(localStorage.getItem("riwayatPenjualan")) || [];
let nomorPenjualan = Number(localStorage.getItem("nomorPenjualan")) || 0;


// =========================
// DATA BARANG
// =========================

function simpanBarang() {

    let kode = document.getElementById("kodeBarang").value;
    let nama = document.getElementById("namaBarang").value;
    let harga = Number(document.getElementById("hargaBarang").value);
    let stok = Number(document.getElementById("stokBarang").value);
    let editIndex = document.getElementById("editIndex").value;

    if (kode === "" || nama === "" || harga <= 0 || stok < 0) {
        alert("Lengkapi data barang!");
        return;
    }

    let dataBarang = {
        kode: kode,
        nama: nama,
        harga: harga,
        stok: stok
    };

    if (editIndex === "") {
        barang.push(dataBarang);
    } else {
        barang[editIndex] = dataBarang;
    }

    localStorage.setItem("barang", JSON.stringify(barang));

    resetForm();
    tampilkanBarang();
    isiPilihanBarang();
   
}

function tampilkanLaporan() {

    let tabel = document.getElementById("tabelLaporan");

    tabel.innerHTML = "";

    riwayatPenjualan.forEach(function(transaksi) {

        transaksi.barang.forEach(function(item, index) {

            tabel.innerHTML += `
                <tr>
                    <td>${String(transaksi.nomor).padStart(6, "0")}</td>
                    <td>${transaksi.tanggal}</td>
                    <td>${transaksi.kasir}</td>
                    <td>${item.nama}</td>
                    <td>${item.jumlah}</td>
                    <td>${formatRupiah(item.harga)}</td>
                    <td>${formatRupiah(item.subtotal)}</td>
                    <td>${index === 0 ? formatRupiah(transaksi.total) : ""}</td>
                    <td>
                        ${transaksi.metodePembayaran === "qris"
                            ? "QRIS"
                            : "Tunai"}
                    </td>

                    <td>
                        ${index === 0
                            ? formatRupiah(transaksi.bayar)
                            : ""}
                    </td>

                    <td>
                        ${index === 0
                            ? formatRupiah(transaksi.kembali)
                            : ""}
                    </td>
                </tr>
            `;
        });
    });
}


function hitungTotalPendapatan() {
    
    let total = 0;
    
    riwayatPenjualan.forEach(function(transaksi) {
        total += transaksi.total;
    });
    
    document.getElementById("totalPendapatan").textContent =
    formatRupiah(total);
}




// =========================
// TAMPILKAN BARANG
// =========================

function tampilkanBarang() {

    let tabel = document.getElementById("tabelBarang");
    let pencarian = document
        .getElementById("cariBarang")
        .value
        .toLowerCase();

    tabel.innerHTML = "";

    barang.forEach(function(item, index) {

        if (
            item.nama.toLowerCase().includes(pencarian) ||
            item.kode.toLowerCase().includes(pencarian)
        ) {

            tabel.innerHTML += `
                <tr>
                    <td>${item.kode}</td>
                    <td>${item.nama}</td>
                    <td>${formatRupiah(item.harga)}</td>
                    <td>${item.stok}</td>

                    <td>
                        <button class="edit"
                            onclick="editBarang(${index})">
                            Edit
                        </button>

                        <button class="danger"
                            onclick="hapusBarang(${index})">
                            Hapus
                        </button>
                    </td>
                </tr>
            `;
        }
    });
}


// =========================
// EDIT BARANG
// =========================

function editBarang(index) {

    let item = barang[index];

    document.getElementById("kodeBarang").value = item.kode;
    document.getElementById("namaBarang").value = item.nama;
    document.getElementById("hargaBarang").value = item.harga;
    document.getElementById("stokBarang").value = item.stok;

    document.getElementById("editIndex").value = index;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================
// HAPUS BARANG
// =========================

function hapusBarang(index) {

    if (confirm("Hapus barang ini?")) {

        barang.splice(index, 1);

        localStorage.setItem(
            "barang",
            JSON.stringify(barang)
        );

        tampilkanBarang();
        isiPilihanBarang();
    }
}


// =========================
// RESET FORM
// =========================

function resetForm() {

    document.getElementById("kodeBarang").value = "";
    document.getElementById("namaBarang").value = "";
    document.getElementById("hargaBarang").value = "";
    document.getElementById("stokBarang").value = "";
    document.getElementById("editIndex").value = "";
}


// =========================
// PILIH BARANG
// =========================

function isiPilihanBarang() {

    let select = document.getElementById("pilihBarang");

    select.innerHTML = `
        <option value="">-- Pilih Barang --</option>
    `;

    barang.forEach(function(item, index) {

        if (item.stok > 0) {

            select.innerHTML += `
                <option value="${index}">
                    ${item.nama} - ${formatRupiah(item.harga)}
                    - Stok: ${item.stok}
                </option>
            `;
        }
    });
}


// =========================
// TAMBAH KERANJANG
// =========================

function tambahKeranjang() {

    let index = document.getElementById("pilihBarang").value;
    let jumlah = Number(
        document.getElementById("jumlahBeli").value
    );
    // let hargaJual = Number(document.getElementById("hargaJual").value);

    if (index === "") {
        alert("Pilih barang terlebih dahulu!");
        return;
    }

    if (jumlah <= 0) {
        alert("Jumlah harus lebih dari 0!");
        return;
    }
    // if (hargaJual <= 0) {
    // alert("Harga jual harus lebih dari 0!");
    // return;
    // }

    let item = barang[index];

    if (jumlah > item.stok) {
        alert("Stok tidak mencukupi!");
        return;
    }

    let itemKeranjang = keranjang.find(function(data) {
        return data.index === Number(index);
    });

    if (itemKeranjang) {

        if (itemKeranjang.jumlah + jumlah > item.stok) {
            alert("Jumlah melebihi stok!");
            return;
        }

        itemKeranjang.jumlah += jumlah;

    } else {

        keranjang.push({
            index: Number(index),
            jumlah: jumlah,
            // hargaJual: hargaJual
        });
    }

    tampilkanKeranjang();

    document.getElementById("jumlahBeli").value = 1;
}


// =========================
// TAMPILKAN KERANJANG
// =========================

function tampilkanKeranjang() {

    let tabel = document.getElementById("tabelKeranjang");

    tabel.innerHTML = "";

    let total = 0;

    keranjang.forEach(function(item, index) {

        let data = barang[item.index];

        let subtotal = data.harga * item.jumlah;

        total += subtotal;

        tabel.innerHTML += `
            <tr>

                <td>${data.nama}</td>

                <td>${formatRupiah(data.harga)}</td>

                <td>${item.jumlah}</td>

                <td>${formatRupiah(subtotal)}</td>

                <td>
                    <button
                        class="danger"
                        onclick="hapusKeranjang(${index})">
                        Hapus
                    </button>
                </td>

            </tr>
        `;
    });

    document.getElementById("totalHarga").textContent =
        formatRupiah(total);

    hitungKembalian();
}


// =========================
// HAPUS KERANJANG
// =========================

function hapusKeranjang(index) {

    keranjang.splice(index, 1);

    tampilkanKeranjang();
}


// =========================
// HITUNG TOTAL
// =========================

function ambilTotal() {

    let total = 0;

    keranjang.forEach(function(item) {

        let data = barang[item.index];

        total += data.harga * item.jumlah;
    });

    return total;
}


// =========================
// HITUNG KEMBALIAN
// =========================

function hitungKembalian() {

    let total = ambilTotal();

    let bayar = Number(
        document.getElementById("uangBayar").value
    );

    let kembali = bayar - total;

    if (kembali < 0) {
        kembali = 0;
    }

    document.getElementById("kembalian").textContent =
        formatRupiah(kembali);
}


// =========================
// PEMBAYARAN
// =========================




function ubahMetodePembayaran() {

    let metode = document.getElementById("metodePembayaran").value;

    let uangBayar = document.getElementById("uangBayar");
    let kembalian = document.getElementById("kembalian").parentElement;

    if (metode === "qris") {

        uangBayar.style.display = "none";
        kembalian.style.display = "none";

    } else {

        uangBayar.style.display = "block";
        kembalian.style.display = "block";
    }
}

function prosesPembayaran() {

    if (keranjang.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    let total = ambilTotal();

    let metode = document.getElementById("metodePembayaran").value;

    let bayar = 0;
    let kembali = 0;

    if (metode === "tunai") {

        bayar = Number(
            document.getElementById("uangBayar").value
        );

        if (bayar < total) {
            alert("Uang pembayaran kurang!");
            return;
        }

        kembali = bayar - total;

    } else {

        // QRIS dibayar di luar aplikasi
        bayar = total;
        kembali = 0;
    }


    // Kurangi stok

    keranjang.forEach(function(item) {
        barang[item.index].stok -= item.jumlah;
    });

    localStorage.setItem(
        "barang",
        JSON.stringify(barang)
    );


    // Nomor transaksi

    nomorPenjualan++;


    // Buat struk

    buatStruk(bayar, total, metode);


    // Simpan transaksi

    let transaksi = {
        nomor: nomorPenjualan,
        tanggal: new Date().toLocaleString("id-ID"),
        kasir: document.getElementById("namaKasir").value,
        metodePembayaran: metode,
        total: total,
        bayar: bayar,
        kembali: kembali,

        barang: keranjang.map(function(item) {

            let data = barang[item.index];

            return {
                nama: data.nama,
                jumlah: item.jumlah,
                harga: data.harga,
                subtotal: data.harga * item.jumlah
            };
        })
    };


    riwayatPenjualan.push(transaksi);

    localStorage.setItem(
        "riwayatPenjualan",
        JSON.stringify(riwayatPenjualan)
    );

    localStorage.setItem(
        "nomorPenjualan",
        nomorPenjualan
    );


    // Reset transaksi

    keranjang = [];

    document.getElementById("uangBayar").value = "";

    tampilkanKeranjang();
    tampilkanBarang();
    isiPilihanBarang();
    tampilkanLaporan();
    hitungTotalPendapatan();
    tampilkanDashboard();

    // Kembali ke Tunai
    document.getElementById("metodePembayaran").value = "tunai";
    ubahMetodePembayaran();
}




// =========================
// BUAT STRUK
// =========================

function buatStruk(bayar, total, metode) {

    
    let namaKasir = document.getElementById("namaKasir").value;

    let isiPembeli = document.getElementById("isiStruk");

    isiPembeli.innerHTML =`<p><strong>No. Penjualan:</strong> ${String(nomorPenjualan).padStart(6, "0")}</p>
    <p><strong>Kasir:</strong> ${namaKasir}</p>
    <hr>
    `;
    
    

    keranjang.forEach(function(item) {

        let data = barang[item.index];

        let subtotal =
            data.harga * item.jumlah;

        isiPembeli.innerHTML += `
            <div class="struk-item">
                <span>
                    ${data.nama} x${item.jumlah}
                </span>

                <span>
                    ${formatRupiah(subtotal)}
                </span>
            </div>
        `;
    });


    let kembalian = bayar - total;

    document.getElementById("detailPembayaran").innerHTML = `
        <p>
            <strong>Metode Pembayaran:</strong>
            ${metode === "qris" ? "QRIS" : "Tunai"}
        </p>

        <p>
            <strong>Total:</strong>
            ${formatRupiah(total)}
        </p>

        <p>
            <strong>Bayar:</strong>
            ${formatRupiah(bayar)}
        </p>

        <p>
            <strong>Kembali:</strong>
            ${formatRupiah(kembalian)}
        </p>
    `;


    let isiPenjual = document.getElementById("isiStrukPenjual");

    isiPenjual.innerHTML = `
        <p><strong>No. Penjualan:</strong> ${String(nomorPenjualan).padStart(6, "0")}</p>
        <p><strong>Kasir:</strong> ${namaKasir}</p>
        
    `;

    keranjang.forEach(function(item) {

        let data = barang[item.index];

        let subtotal = data.harga * item.jumlah;

        isiPenjual.innerHTML += `
            <div class="struk-item">
                <span>${data.nama} x${item.jumlah}</span>
                <span>${formatRupiah(subtotal)}</span>
            </div>
        `;
    });

    document.getElementById("detailPembayaranPenjual").innerHTML = `
        <p><strong>Metode Pembayaran:</strong> ${metode === "qris" ? "QRIS" : "Tunai"}</p>
        <p><strong>Total:</strong> ${formatRupiah(total)}</p>
        <p><strong>Bayar:</strong> ${formatRupiah(bayar)}</p>
        <p><strong>Kembali:</strong> ${formatRupiah(kembalian)}</p>
    `;



  
    document.body.classList.add("mode-struk");
    window.print();
    document.body.classList.remove("mode-struk");
    
    
}

function cetakLaporan() {

    document.body.classList.add("mode-laporan");

    setTimeout(function() {
        window.print();
        document.body.classList.remove("mode-laporan");
    }, 300);
}
function cetakStrukPembeli() {
    window.print();
}

function cetakStrukPenjual() {
    window.print();
}

// =========================
// FORMAT RUPIAH
// =========================

function formatRupiah(angka) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}


// =========================
// JALANKAN SAAT WEBSITE DIBUKA
// =========================

tampilkanBarang();
isiPilihanBarang();

function exportData() {

    let data = {
        barang: barang,
        riwayatPenjualan: riwayatPenjualan,
        nomorPenjualan: nomorPenjualan
    };

    let file = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    let link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = "data-kasir.json";

    link.click();

    URL.revokeObjectURL(link.href);
}


function importData(event) {
    let file = event.target.files[0];

    if (!file) {
        return;
    }

    let reader = new FileReader();

    reader.onload = function(e) {
        try {
            let data = JSON.parse(e.target.result);

            if (!data.barang || !Array.isArray(data.barang)) {
                alert("File data tidak valid!");
                return;
            }

            barang = data.barang;
            riwayatPenjualan = data.riwayatPenjualan || [];
            nomorPenjualan = data.nomorPenjualan || 0;

            localStorage.setItem("barang", JSON.stringify(barang));
            localStorage.setItem("riwayatPenjualan", JSON.stringify(riwayatPenjualan));
            localStorage.setItem("nomorPenjualan", nomorPenjualan);


            tampilkanBarang();
            isiPilihanBarang();
            tampilkanLaporan();
            hitungTotalPendapatan();
            tampilkanDashboard();

            alert("Data berhasil diimport!");
        } 
        catch (error) {
            alert("File tidak dapat dibaca!");
        }
    };

    reader.readAsText(file);
}

function tampilkanDashboard() {

    document.getElementById("jumlahBarang").textContent =
        barang.length;

    document.getElementById("jumlahTransaksi").textContent =
        riwayatPenjualan.length;

    let total = 0;

    riwayatPenjualan.forEach(function(transaksi) {
        total += transaksi.total;
    });

    document.getElementById("pendapatanDashboard").textContent =
        formatRupiah(total);
}

tampilkanDashboard();