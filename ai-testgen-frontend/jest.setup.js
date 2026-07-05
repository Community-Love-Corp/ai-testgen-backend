
import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom'; // Add this line
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
