#!/bin/bash
cd /home/kavia/workspace/code-generation/quickeats-food-delivery-321009-321019/food_delivery_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

