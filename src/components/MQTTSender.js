import React, { useEffect, useCallback } from 'react'
import {
  IoTDataPlaneClient,
  PublishCommand,
} from '@aws-sdk/client-iot-data-plane'

const AWS_IOT_ENDPOINT_HOST = 'aolte5w7dadxl-ats.iot.eu-west-1.amazonaws.com'
const MQTT_TOPIC = '~/aws/iot/ggv2/PiBot'

const MQTTSender = ({ keysPressed }) => {
  console.log(
    process.env.REACT_APP_AWS_REGION,
    process.env.REACT_APP_AWS_ACCESS_KEY,
    process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
  )
  const sendMQTTMessage = useCallback(async () => {
    try {
      const iotDataPlaneClient = new IoTDataPlaneClient({
        endpoint: `https://${process.env.REACT_APP_AWS_IOT_ENDPOINT_HOST}`,
        region: 'eu-west-1',
        credentials: {
          accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
          secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        },
      })

      const command = new PublishCommand({
        topic: process.env.REACT_APP_MQTT_TOPIC,
        payload: new TextEncoder().encode(
          JSON.stringify({ movement: keysPressed })
        ),
        qos: 0,
      })

      await iotDataPlaneClient.send(command)
      console.log('Message published to IoT topic')
    } catch (error) {
      console.error('Error publishing to IoT topic:', error)
    }
  }, [keysPressed])

  // Send MQTT message when keys change
  useEffect(() => {
    sendMQTTMessage()
  }, [keysPressed, sendMQTTMessage])

  return <div></div> // Render as needed, or return null if nothing to render
}

export default MQTTSender
