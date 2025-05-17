<!DOCTYPE html>
<html>
<head>
    <title>Transaksi Manual Baru</title>
</head>
<body>
    <h3>Transaksi Manual Baru Telah Dibuat</h3>
    <p><strong>Ref ID:</strong> {{ $transaction->ref_id }}</p>
    <p><strong>Produk:</strong> {{ $transaction->product_name }}</p>
    <p><strong>Harga:</strong> Rp{{ number_format($transaction->price_product, 0, ',', '.') }}</p>
    <p><strong>Customer No:</strong> {{ $transaction->customer_no }}</p>
    <p><strong>Status:</strong> {{ $transaction->status }}</p>
</body>
</html>
