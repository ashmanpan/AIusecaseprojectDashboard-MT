#!/bin/bash

# Deploy Analyze Test Cases Lambda Function
# Prerequisites: AWS CLI configured, Node.js installed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LAMBDA_DIR="$PROJECT_ROOT/lambda/analyze-testcases"
STACK_NAME="analyze-testcases-api"
ENVIRONMENT="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"

echo "=== Deploying Analyze Test Cases Lambda ==="
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"

# Step 1: Install dependencies
echo ""
echo "Step 1: Installing Lambda dependencies..."
cd "$LAMBDA_DIR"
npm install --production

# Step 2: Create deployment package
echo ""
echo "Step 2: Creating deployment package..."
DEPLOY_DIR="$PROJECT_ROOT/deploy"
mkdir -p "$DEPLOY_DIR"
ZIP_FILE="$DEPLOY_DIR/analyze-testcases.zip"

# Remove old zip if exists
rm -f "$ZIP_FILE"

# Create zip with node_modules
zip -r "$ZIP_FILE" index.js node_modules/

echo "Created: $ZIP_FILE"

# Step 3: Deploy CloudFormation stack
echo ""
echo "Step 3: Deploying CloudFormation stack..."
cd "$PROJECT_ROOT"

aws cloudformation deploy \
    --template-file cloudformation/analyze-testcases-api.yaml \
    --stack-name "$STACK_NAME-$ENVIRONMENT" \
    --parameter-overrides Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

# Step 4: Update Lambda function code
echo ""
echo "Step 4: Updating Lambda function code..."
FUNCTION_NAME="analyze-testcases-$ENVIRONMENT"

aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$ZIP_FILE" \
    --region $REGION

# Step 5: Get API endpoint
echo ""
echo "Step 5: Getting API endpoint..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME-$ENVIRONMENT" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text \
    --region $REGION)

echo ""
echo "=== Deployment Complete ==="
echo "API Endpoint: $API_ENDPOINT"
echo ""
echo "Update js/ai-analyzer.js with this endpoint:"
echo "  apiEndpoint: '$API_ENDPOINT'"
echo ""

# Optional: Update the ai-analyzer.js file
read -p "Update ai-analyzer.js automatically? (y/n): " UPDATE_FILE
if [ "$UPDATE_FILE" = "y" ]; then
    sed -i "s|apiEndpoint:.*|apiEndpoint: '$API_ENDPOINT',|" "$PROJECT_ROOT/js/ai-analyzer.js"
    echo "Updated js/ai-analyzer.js"
fi

echo ""
echo "Done!"
