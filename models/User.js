import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    coin: {type: Number, required: true, default: 0},
    commissionCoin: {type: Number, required: true, default: 0},
    voiceStat: {type: Array},
    messageStat: {type: Array},
    invites: {type: Array},
    inviter: {type: String, default: null},
    last100VoiceActivity: {type: Array},
    last100MessageActivity: {type: Array},
    last100InviteActivity: {type: Array},
    last100CommisonActivity: {type: Array},
});

UserSchema.index({ id: 1 });


export default mongoose.model('User', UserSchema);
