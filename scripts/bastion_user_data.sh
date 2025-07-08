#!/bin/bash
yum update -y
yum install -y htop tree unzip

# Create welcome message
cat > /etc/motd << 'MOTD'
╔══════════════════════════════════════════════════════════════════╗
║                      BASTION HOST                                ║
║                                                                  ║
║  This is a bastion host for secure access to private resources   ║
║  Please follow security best practices:                          ║
║  - Do not store sensitive data on this host                      ║
║  - Use key-based authentication only                             ║
║  - Log all activities                                            ║
║                                                                  ║
║  Available commands:                                             ║
║  - connect-app: Connect to application servers                   ║
║  - list-servers: List all private servers                        ║
╚══════════════════════════════════════════════════════════════════╝
MOTD

# Create connect-app script
cat > /home/ec2-user/connect-app << 'SCRIPT'
#!/bin/bash
echo "Finding application servers..."

PRIVATE_IPS=$$(aws ec2 describe-instances --filters "Name=tag:Name,Values=*app*" "Name=instance-state-name,Values=running" --query 'Reservations[*].Instances[*].PrivateIpAddress' --output text --region us-east-1)

if [ -z "$$PRIVATE_IPS" ]; then
  echo "No application servers found"
  exit 1
fi

echo "Available application servers:"
IPS_ARRAY=($$PRIVATE_IPS)
for i in "$${!IPS_ARRAY[@]}"; do
  echo "$$((i+1)). $${IPS_ARRAY[i]}"
done

if [ $${#IPS_ARRAY[@]} -eq 1 ]; then
  IP=$${IPS_ARRAY[0]}
  echo "Connecting to: $$IP"
else
  read -p "Choose server [1-$${#IPS_ARRAY[@]}]: " choice
  choice=$$((choice-1))
  if [ $$choice -ge 0 ] && [ $$choice -lt $${#IPS_ARRAY[@]} ]; then
    IP=$${IPS_ARRAY[$$choice]}
    echo "Connecting to: $$IP"
  else
    echo "Invalid choice"
    exit 1
  fi
fi

ssh -o StrictHostKeyChecking=no ec2-user@$$IP
SCRIPT

chmod +x /home/ec2-user/connect-app

# Create list-servers script
cat > /home/ec2-user/list-servers << 'SCRIPT'
#!/bin/bash
echo "Listing all servers in private subnets..."

aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query 'Reservations[*].Instances[*].[Tags[?Key==\`Name\`].Value|[0],InstanceId,PrivateIpAddress,InstanceType]' --output table --region us-east-1
SCRIPT

chmod +x /home/ec2-user/list-servers

echo "export AWS_DEFAULT_REGION=us-east-1" >> /home/ec2-user/.bashrc

chown ec2-user:ec2-user /home/ec2-user/connect-app /home/ec2-user/list-servers