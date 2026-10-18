const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://sandunsbandara13_db_user:8KZh5qqhZbst9XVQ@cluster0.izmxy6p.mongodb.net/webcodoo-pos?appName=Cluster0';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('webcodoo-pos');

  // Find paid web orders
  const paidOrders = await db.collection('orders').find({
    source: 'webcodoo',
    status: { $in: ['confirmed', 'delivered'] },
  }).toArray();

  console.log(`Found ${paidOrders.length} paid web order(s):`, paidOrders.map(o => o.orderId));

  let created = 0;
  for (const order of paidOrders) {
    const orderId = order.orderId ?? order._id.toString();

    // Check if Sales already exist for this order
    const existing = await db.collection('sales').countDocuments({ webOrderId: orderId });
    if (existing > 0) {
      console.log(`  ${orderId}: already has ${existing} sale(s), skipping`);
      continue;
    }

    // Look up customer by phone
    let customerId;
    const phone = order.phone ?? '';
    if (phone) {
      const d = phone.replace(/\D/g, '');
      const variants = [phone, d, `0${d.slice(-9)}`, `94${d.slice(-9)}`, `+94${d.slice(-9)}`];
      const customer = await db.collection('customers').findOne({
        $or: variants.flatMap(v => [{ phone: v }, { mobile: v }]),
      });
      if (customer) customerId = customer._id;
    }

    const items = order.items ?? [];
    for (const item of items) {
      const itemName = item.productName ?? item.name ?? '';
      const itemPrice = Number(item.price ?? 0);
      const itemQty = Number(item.qty ?? 1);
      const planLabel = item.planLabel ?? item.plan ?? '';
      const displayName = planLabel ? `${itemName} (${planLabel})` : itemName;

      // Try to find matching product
      let productId;
      if (itemName) {
        const product = await db.collection('products').findOne({
          name: { $regex: new RegExp(itemName.split(' ')[0], 'i') },
        });
        if (product) productId = product._id;
      }

      const saleDoc = {
        originalPrice: itemPrice,
        discount: 0,
        finalPrice: itemPrice * itemQty,
        saleDate: order.createdAt ?? new Date(),
        isPaid: true,
        notificationSent: false,
        source: 'webcodoo',
        webOrderId: orderId,
        productName: displayName,
        notes: `Web order ${orderId}${order.notes ? ' — ' + order.notes : ''}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (productId) saleDoc.product = productId;
      if (customerId) saleDoc.customer = customerId;

      await db.collection('sales').insertOne(saleDoc);
      console.log(`  ${orderId}: created sale for "${displayName}" @ ${itemPrice} x${itemQty}`);
      created++;
    }
  }

  console.log(`\nDone. Created ${created} sale record(s).`);
  await client.close();
}

run().catch(console.error);
