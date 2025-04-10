> mkcert cert
> Created a new certificate valid for the following names 📜

- "cert"
  The certificate is at "./cert.pem" and the key at "./cert-key.pem" ✅
  It will expire on 9 July 2027 🗓

# STILL IN DEVELOPMENT

## WebRTC Offer/Answer Process (Without ICE Layer)

The offer/answer process is performed both when a call is first established, and any time the call's format or configuration changes.

### 📞 Caller Side (Initiator)

1. **Capture Local Media**  
   Uses `navigator.MediaDevices.getUserMedia()` to get audio/video streams.

2. **Create Peer Connection**  
   Creates an `RTCPeerConnection` object.

3. **Add Media Tracks**  
   Calls `RTCPeerConnection.addTrack()` to attach media tracks (since `addStream()` is deprecated).

4. **Create Offer**  
   Calls `RTCPeerConnection.createOffer()` to create an SDP offer.

5. **Set Local Description**  
   Calls `RTCPeerConnection.setLocalDescription(offer)` to set the offer as the local description.

6. **Gather ICE Candidates**  
   After setting local description, ICE candidates are gathered via STUN servers.

7. **Send Offer**  
   Uses a signaling server to transmit the offer to the recipient.

---

### 🎧 Recipient Side (Answerer)

8. **Set Remote Description**  
   Receives the offer and calls `RTCPeerConnection.setRemoteDescription(offer)`.

9. **Capture Local Media**  
   Captures local media using `getUserMedia()`.

10. **Add Media Tracks**  
    Calls `addTrack()` to attach local media tracks to its peer connection.

11. **Create Answer**  
    Calls `RTCPeerConnection.createAnswer()` to generate an SDP answer.

12. **Set Local Description**  
    Calls `RTCPeerConnection.setLocalDescription(answer)`.

13. **Send Answer**  
    Uses signaling server to send the answer back to the caller.

---

### 🔁 Final Steps (Caller)

14. **Receive Answer**  
    Caller receives the answer from the signaling server.

15. **Set Remote Description**  
    Calls `RTCPeerConnection.setRemoteDescription(answer)`.

✅ **Connection is now fully established**, and media begins to flow between the peers.

# offers

```typescript
type offer = {
  socketid: string;
  offer: Offer;
  offerer_name: string;
  offerericecandidates: IceCandidate[];
  answerer_socket_id: string;
  answer: Answer;
  answerericecandidates: IceCandidate[];
};
```
