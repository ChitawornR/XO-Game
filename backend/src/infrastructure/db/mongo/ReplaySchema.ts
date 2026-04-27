import mongoose, { Schema, Document } from 'mongoose';
import { Player } from '../../../domain/entities/Player';
import { Move } from '../../../domain/entities/Move';

export interface ReplayDocument extends Document {
  size: number;
  winner: Player | null;
  moves: Move[];
  isSinglePlayer: boolean;
  isOnline: boolean;
  createdAt: Date;
  userId?: string;
}

const moveSchema = new Schema<Move>(
  {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    player: { type: String, enum: ['X', 'O'], required: true },
    at: { type: Date },
  },
  { _id: false }
);

const replaySchema = new Schema<ReplayDocument>(
  {
    size: { type: Number, required: true },
    winner: { type: String, enum: ['X', 'O', null], default: null },
    moves: { type: [moveSchema], required: true },
    isSinglePlayer: { type: Boolean, required: true },
    isOnline: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    userId: { type: String },
  },
  { timestamps: false }
);

export const ReplayModel = mongoose.model<ReplayDocument>('Replay', replaySchema);
