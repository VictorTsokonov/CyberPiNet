import React, { useState, useRef, useEffect } from 'react'
import {
  SignalingClient,
  Role,
  SigV4RequestSigner,
} from 'amazon-kinesis-video-streams-webrtc'
import AWS from 'aws-sdk'

// REACT_APP_AWS_REGION=eu-west-1
// REACT_APP_AWS_ACCESS_KEY=AKIASXQ6ZXVO7UNEOZPF
// REACT_APP_AWS_SECRET_ACCESS_KEY=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
// REACT_APP_AWS_IOT_ENDPOINT_HOST=aolte5w7dadxl-ats.iot.eu-west-1.amazonaws.com
// REACT_APP_MQTT_TOPIC=~/aws/iot/ggv2/PiBot

const KinesisVideoViewer = () => {
  const videoRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [signalingClient, setSignalingClient] = useState(null)

  useEffect(() => {
    return () => {
      if (signalingClient) {
        signalingClient.close()
      }
    }
  }, [signalingClient])

  const getChannelARN = async (channelName) => {
    // AWS Configuration
    AWS.config.region = process.env.REACT_APP_AWS_REGION
    AWS.config.credentials = new AWS.Credentials(
      process.env.REACT_APP_AWS_ACCESS_KEY,
      process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    )

    const kinesisVideoClient = new AWS.KinesisVideo({
      region: AWS.config.region,
    })
    const response = await kinesisVideoClient
      .describeSignalingChannel({
        ChannelName: channelName,
      })
      .promise()

    return response.ChannelInfo.ChannelARN
  }

  const startViewer = async () => {
    const channelARN = await getChannelARN('PiBot')
    console.log(channelARN)

    // Initialize the Kinesis Video Signaling Client
    const kinesisVideoClient = new AWS.KinesisVideo({
      region: AWS.config.region,
    })
    const getEndpointsByRegionResponse = await kinesisVideoClient
      .getSignalingChannelEndpoint({
        ChannelARN: channelARN,
        SingleMasterChannelEndpointConfiguration: {
          Protocols: ['WSS', 'HTTPS'],
          Role: Role.VIEWER,
        },
      })
      .promise()

    const endpointsByProtocol =
      getEndpointsByRegionResponse.ResourceEndpointList.reduce(
        (endpoints, endpoint) => {
          endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint
          return endpoints
        },
        {}
      )

    const viewer = new SignalingClient({
      channelARN,
      channelEndpoint: endpointsByProtocol['WSS'],
      clientId: 'some-client-id',
      role: Role.VIEWER,
      region: AWS.config.region,
      requestSigner: new SigV4RequestSigner(
        AWS.config.region,
        AWS.config.credentials
      ),
      systemClockOffset: kinesisVideoClient.config.systemClockOffset,
    })

    setSignalingClient(viewer)

    const peerConnection = new RTCPeerConnection({
      iceServers: [],
    })

    peerConnection.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0]
    }

    viewer.on('open', async () => {
      console.log('Signaling client connected')

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      await peerConnection.setLocalDescription(offer)

      viewer.sendSdpOffer(offer)
    })

    viewer.on('sdpAnswer', async (answer) => {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      )
    })

    viewer.on('iceCandidate', (candidate) => {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    })

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        viewer.sendIceCandidate(event.candidate)
      }
    }

    viewer.open()
  }

  const connectViewer = () => {
    if (!isConnected) {
      startViewer()
      setIsConnected(true)
    }
  }

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
      />
      {!isConnected && <button onClick={connectViewer}>Connect</button>}
    </div>
  )
}

export default KinesisVideoViewer
