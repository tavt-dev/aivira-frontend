import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { MockService } from '../services/mockService';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components