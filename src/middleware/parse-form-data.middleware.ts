import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

function parseFormDataObject(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const result: any = {};
  for (let [key, value] of Object.entries(body)) {
    // Handle booleans commonly sent as strings in multipart/form-data
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (value === 'null') value = null;

    // Convert keys like 'contractorData.licenses[0].number' to 'contractorData.licenses.0.number'
    const cleanKey = key.replace(/\[(\w+)\]/g, '.$1');
    const path = cleanKey.split('.');
    
    let current = result;
    for (let i = 0; i < path.length; i++) {
        const part = path[i];
        if (i === path.length - 1) {
            current[part] = value;
        } else {
            const nextPart = path[i + 1];
            if (current[part] === undefined) {
                // If the next part is an integer, initialize an array; otherwise an object
                current[part] = /^\d+$/.test(nextPart) ? [] : {};
            }
            current = current[part];
        }
    }
  }
  return result;
}

@Injectable()
export class ParseFormDataMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      // Check if body contains flat dot-notation or bracket-notation keys that need parsing
      const requiresDeepParsing = Object.keys(req.body).some(k => k.includes('.') || k.includes('['));
      
      if (requiresDeepParsing) {
        req.body = parseFormDataObject(req.body);
      } else {
        // Even if flat, try parsing stringified booleans since form-data sends all values as strings
        for (const [key, value] of Object.entries(req.body)) {
          if (value === 'true') req.body[key] = true;
          if (value === 'false') req.body[key] = false;
        }
      }
    }
    next();
  }
}
