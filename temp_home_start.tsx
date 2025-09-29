import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  Star, 
  MapPin, 
  Clock,
  Search,
  Filter,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { productsApi, sellersApi } from '../services/api';
import { Product, Seller } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isReady } = useTelegram();
  const { t } = useLocalization();
