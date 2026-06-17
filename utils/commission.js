// utils/commission.js
// LocalApp ke commission rates — yahan se control karo
// LAUNCH PHASE: Low rates rakhe hain taaki vendors/drivers attract hon
// (Zomato/Swiggy 20-30% leti hain, hum bahut kam rakh rahe hain shuru mein)

const COMMISSION_RATES = {
  food: 0.07,     // 7% food orders pe (launch rate)
  grocery: 0.05,  // 5% grocery orders pe (launch rate)
  ride: 0.06,     // 6% rides pe (launch rate)
};

// Order ke liye commission calculate karo
const calculateOrderCommission = (type, subtotal) => {
  const rate = COMMISSION_RATES[type] ?? 0.10;
  const platformCommission = Math.round(subtotal * rate);
  const vendorPayout = subtotal - platformCommission;
  return { commissionRate: rate, platformCommission, vendorPayout };
};

// Ride ke liye commission calculate karo
const calculateRideCommission = (fare) => {
  const rate = COMMISSION_RATES.ride;
  const platformCommission = Math.round(fare * rate);
  const driverPayout = fare - platformCommission;
  return { commissionRate: rate, platformCommission, driverPayout };
};

module.exports = { COMMISSION_RATES, calculateOrderCommission, calculateRideCommission };
