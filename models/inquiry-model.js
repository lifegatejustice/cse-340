const pool = require('../database/index');

const InquiryModel = {
  async createInquiry(inquiryData) {
    const { inv_id, customer_name, customer_email, customer_phone, message } = inquiryData;
    const sql = `INSERT INTO inquiries (inv_id, customer_name, customer_email, customer_phone, message) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    return await pool.query(sql, [inv_id, customer_name, customer_email, customer_phone, message]);
  },

  async getInquiriesByVehicle(inv_id) {
    const sql = `SELECT * FROM inquiries WHERE inv_id = $1 ORDER BY inquiry_date DESC`;
    return await pool.query(sql, [inv_id]);
  },

  async getAllInquiries() {
    const sql = `SELECT i.*, v.inv_make, v.inv_model, v.inv_year 
                 FROM inquiries i 
                 JOIN inventory v ON i.inv_id = v.inv_id 
                 ORDER BY i.inquiry_date DESC`;
    return await pool.query(sql);
  }
};

module.exports = InquiryModel;