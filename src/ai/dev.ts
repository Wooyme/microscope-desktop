'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-next-move.ts';
import '@/ai/flows/critique-and-regenerate.ts';

    
