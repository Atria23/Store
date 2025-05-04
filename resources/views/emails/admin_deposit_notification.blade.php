<h2>{{ $type === 'proof' ? 'Bukti Pembayaran Baru' : 'Permintaan Deposit Baru' }}</h2>

<p><strong>User:</strong> {{ $deposit->user->name }} ({{ $deposit->user->email }})</p>
<p><strong>Jumlah Deposit:</strong> Rp{{ number_format($deposit->amount, 0, ',', '.') }}</p>
<p><strong>Total Bayar:</strong> Rp{{ number_format($deposit->total_pay, 0, ',', '.') }}</p>
<p><strong>Metode:</strong> {{ strtoupper($deposit->payment_method) }}</p>
<p><strong>Status:</strong> {{ ucfirst($deposit->status) }}</p>

@if ($type === 'proof')
<p><strong>Bukti pembayaran:</strong> Sudah diunggah.</p>
@endif
