// server/models/SuperAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SuperAdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Usar función normal (no arrow function) y async/await
SuperAdminSchema.pre('save', async function() {
  const user = this;
  
  // Solo encriptar si la contraseña fue modificada
  if (!user.isModified('password')) return;
  
  // Encriptar contraseña
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Método para comparar contraseñas
SuperAdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);