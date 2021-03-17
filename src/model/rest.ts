import mongoose from 'mongoose';

export interface restaurantParams {
  name: string;
  url: string;
  date: Date;
  locate: string;
  foodtype: string;
  tags: string[];
  summary: string;
  imgs: string[];
  desc: string;
}

export interface restaurant extends mongoose.Document, restaurantParams {}

const schema = new mongoose.Schema({
  name: {
    type: String
  },
  url: {
    type: String
  },
  date: {
    type: String
  },
  locate: {
    type: String
  },
  foodtype: {
    type: String
  },
  tags: [{
    type: String
  }],
  summary: {
    type: String
  },
  imgs: [{
    type: String
  }],
  desc: {
    type: String
  }
});

export const restaurantModel = mongoose.model<restaurant>('restaurants', schema);
