<!-- 

DROP VIEW IF EXISTS transactions_history;

CREATE VIEW transactions_history AS
SELECT
    user_id,
    ref_id AS id_transaksi,
    product_name,
    customer_no,
    status,
    price_product AS price,
    buyer_last_saldo AS saldo_terakhir,
    sn,
    created_at
FROM
    transactions;


     -->