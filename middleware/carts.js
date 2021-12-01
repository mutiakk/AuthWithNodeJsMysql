const mysql=require('mysql/promise');
const config= require('../lib/db')

async function validateCart(){
    //id barang di produk
    var cartId= req.body.id;
    const connection = await mysql.createConnection(config.db);        
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    console.log('Finished setting the isolation level to read committed');
    await connection.beginTransaction();

    try {
        await connection.execute('SELECT id, name FROM produk WHERE id IN (?, ?) FOR UPDATE', cartId);
        console.log(`Locked rows for skus ${cartId.join()}`);
        const [itemsToOrder,] = await connection.execute(
            'SELECT name, qty, price from produk WHERE id IN (?, ?) ORDER BY id',
            cartId
            );
            console.log('Selected quantities for item');
            let orderTotal = 0;
            let orderItems = [];
            for (itemToOrder of itemsToOrder) {
                if (itemToOrder.qty < 1) {
                    throw new Error(`One of the cartId is out of stock ${itemToOrder.name}`);
                }
                console.log(`Quantity for ${itemToOrder.idCart} is ${itemToOrder.qty}`);
                orderTotal += itemToOrder.qty;
                orderItems.push(itemToOrder.idCart);
            }
            await connection.execute(
                'INSERT INTO cart (idCart, qty) VALUES (?, ?)', 
                [orderItems.join(), orderTotal]
              )
              console.log(`Order created`);
              await connection.execute(
                `UPDATE produk SET qty=qty - 1 WHERE id IN (?, ?)`,
                idCart
              );
              console.log(`Deducted quantities by 1 for ${cartId.join()}`);
              await connection.commit();
              const [rows,] = await connection.execute('SELECT LAST_INSERT_ID() as id');
              return `order created with id ${rows[0].id}`;
            } catch (err) {
              console.error(`Error occurred while creating order: ${err.message}`, err);
              connection.rollback();
              console.info('Rollback successful');
              return 'error creating order';
            }
        }
        (async function testOrderCreate() {
            console.log(await validateCart());
            process.exit(0);
        })();