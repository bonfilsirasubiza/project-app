const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const RawMaterial = require("./models/RawMaterial");
const Supplier = require("./models/Supplier");
const StockIn = require("./models/Stockn");
const StockOut = require("./models/Stockut");

dotenv.config();

const MONGO_URL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/RM";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB Connected");

    // Clear existing data
    await User.deleteMany();
    await RawMaterial.deleteMany();
    await Supplier.deleteMany();
    await StockIn.deleteMany();
    await StockOut.deleteMany();

    console.log("Old data deleted");

    // Create admin user
    await User.create({
      username: "Admin",
      email: "admin@gmail.com",
      password: "123456",
      role: "admin"
    });

    console.log("Admin created");

    // Create raw materials - matching your form fields
    const materials = await RawMaterial.insertMany([
      {
        materialCode: "RM001",
        materialName: "Steel",
        unit: "kg",
        quantity: 100,
        unitPrice: 50
      },
      {
        materialCode: "RM002",
        materialName: "Aluminum",
        unit: "kg", 
        quantity: 200,
        unitPrice: 30
      },
      {
        materialCode: "RM003",
        materialName: "Copper",
        unit: "kg",
        quantity: 50,
        unitPrice: 80
      },
      {
        materialCode: "RM004",
        materialName: "Plastic Granules",
        unit: "kg",
        quantity: 15,
        unitPrice: 20
      },
      {
        materialCode: "RM005",
        materialName: "Wood",
        unit: "pcs",
        quantity: 5,
        unitPrice: 150
      },
      {
        materialCode: "RM006", 
        materialName: "Paint",
        unit: "liters",
        quantity: 8,
        unitPrice: 25
      }
    ]);

    console.log(`${materials.length} raw materials created`);

    // Create suppliers - matching your form fields
    const suppliers = await Supplier.insertMany([
      {
        supplierCode: "SUP001",
        supplierName: "ABC Metals",
        phoneNumber: "+1234567890",
        email: "contact@abcmetals.com",
        address: "123 Industrial Area, Metal City"
      },
      {
        supplierCode: "SUP002",
        supplierName: "Global Supplies Ltd",
        phoneNumber: "+9876543210",
        email: "info@globalsupplies.com",
        address: "456 Trade Center, Business District"
      },
      {
        supplierCode: "SUP003",
        supplierName: "Raw Materials Inc",
        phoneNumber: "+1122334455",
        email: "sales@rawmaterials.com",
        address: "789 Warehouse Ave, Industrial Park"
      },
      {
        supplierCode: "SUP004",
        supplierName: "Quality Parts Co",
        phoneNumber: "+9988776655",
        email: "orders@qualityparts.com",
        address: "321 Factory Road, Manufacturing Hub"
      }
    ]);

    console.log(`${suppliers.length} suppliers created`);

    // Get admin user for receivedBy field
    const admin = await User.findOne({ email: "admin@gmail.com" });

    // Create stock in records
    const stockIns = await StockIn.insertMany([
      {
        material: materials[0]._id,
        supplier: suppliers[0]._id,
        quantity: 50,
        unitPrice: 48,
        date: new Date("2024-01-15"),
        invoiceNumber: "INV-2024-001",
        receivedBy: admin._id,
        notes: "Regular shipment",
        status: "completed"
      },
      {
        material: materials[1]._id,
        supplier: suppliers[1]._id,
        quantity: 100,
        unitPrice: 28,
        date: new Date("2024-01-20"),
        invoiceNumber: "INV-2024-002",
        receivedBy: admin._id,
        notes: "Bulk order",
        status: "completed"
      },
      {
        material: materials[2]._id,
        supplier: suppliers[0]._id,
        quantity: 25,
        unitPrice: 75,
        date: new Date("2024-02-01"),
        invoiceNumber: "INV-2024-003",
        receivedBy: admin._id,
        notes: "Emergency order",
        status: "completed"
      },
      {
        material: materials[3]._id,
        supplier: suppliers[2]._id,
        quantity: 200,
        unitPrice: 18,
        date: new Date("2024-02-10"),
        invoiceNumber: "INV-2024-004",
        receivedBy: admin._id,
        notes: "Monthly supply",
        status: "completed"
      },
      {
        material: materials[4]._id,
        supplier: suppliers[3]._id,
        quantity: 50,
        unitPrice: 120,
        date: new Date("2024-02-15"),
        invoiceNumber: "INV-2024-005",
        receivedBy: admin._id,
        notes: "Special order",
        status: "completed"
      },
      {
        material: materials[5]._id,
        supplier: suppliers[2]._id,
        quantity: 30,
        unitPrice: 22,
        date: new Date("2024-02-20"),
        invoiceNumber: "INV-2024-006",
        receivedBy: admin._id,
        notes: "Color assortment",
        status: "completed"
      }
    ]);

    console.log(`${stockIns.length} stock in records created`);

    // Create stock out records - FIXED: Using enum values that match your StockOut model
    const stockOuts = await StockOut.insertMany([
      {
        material: materials[0]._id, // Steel
        quantity: 30,
        purpose: "production", // Must match enum value
        date: new Date("2024-01-25"),
        notes: "Regular production use"
      },
      {
        material: materials[1]._id, // Aluminum
        quantity: 45,
        purpose: "production", // Must match enum value
        date: new Date("2024-01-28"),
        notes: "Weekly production"
      },
      {
        material: materials[2]._id, // Copper
        quantity: 15,
        purpose: "production", // Must match enum value
        date: new Date("2024-02-05"),
        notes: "Electrical department"
      },
      {
        material: materials[3]._id, // Plastic Granules
        quantity: 185,
        purpose: "production", // Must match enum value
        date: new Date("2024-02-12"),
        notes: "High volume production"
      },
      {
        material: materials[4]._id, // Wood
        quantity: 45,
        purpose: "production", // Must match enum value
        date: new Date("2024-02-18"),
        notes: "Packaging department"
      },
      {
        material: materials[5]._id, // Paint
        quantity: 22,
        purpose: "production", // Must match enum value
        date: new Date("2024-02-22"),
        notes: "Finishing department"
      }
    ]);

    console.log(`${stockOuts.length} stock out records created`);

    // Alternative: If you want to see what enum values are available in your StockOut model
    console.log("\n=== STOCK OUT MODEL INFO ===");
    const stockOutSchema = StockOut.schema.paths;
    if (stockOutSchema.purpose) {
      console.log("Purpose enum values:", stockOutSchema.purpose.enumValues || "Not an enum");
    }

    // Verify stock in records were created with totalAmount calculated
    console.log("\n=== STOCK IN VERIFICATION ===");
    for (const stockIn of stockIns) {
      console.log(`Stock In: ${stockIn.quantity} x ${stockIn.unitPrice} = ${stockIn.totalAmount} RWF`);
    }

    // Log summary statistics
    console.log("\n=== SEEDING SUMMARY ===");
    console.log(`Users: 1 (Admin)`);
    console.log(`Raw Materials: ${materials.length}`);
    console.log(`Suppliers: ${suppliers.length}`);
    console.log(`Stock In Records: ${stockIns.length}`);
    console.log(`Stock Out Records: ${stockOuts.length}`);
    
    // Show low stock materials (quantity < 10)
    const lowStockMaterials = materials.filter(m => m.quantity < 10);
    if (lowStockMaterials.length > 0) {
      console.log("\n⚠️ Low Stock Materials (quantity < 10):");
      lowStockMaterials.forEach(m => {
        console.log(`   - ${m.materialName}: ${m.quantity} ${m.unit}`);
      });
    }

    // Show updated material quantities after stock in/out
    console.log("\n📊 FINAL MATERIAL QUANTITIES:");
    const updatedMaterials = await RawMaterial.find();
    updatedMaterials.forEach(m => {
      console.log(`   - ${m.materialName}: ${m.quantity} ${m.unit}`);
    });

    console.log("\n✅ Database seeded successfully!");
    
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();