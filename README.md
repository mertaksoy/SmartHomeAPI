# NodeJS Smart Home API

This API allows you to controll your smart home appliances via REST API.

### Features
  - get list of smart devices like light bulbs, remote controls: GET /devices
  - get list of grouped devices: GET /groups
  - toggle onOff status of a group: POST /group/{groupId}/toggle
  
### Planned features
  - toggle onOff status of a device
  - set brightnes of a device
  - set color of a device
