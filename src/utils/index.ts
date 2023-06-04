export function generateInvitationLink(id: number) {
  let t = {
    id
  }
  let inviteinfo_base64 = window.btoa(JSON.stringify(t))
  let link = location.origin + '/mine?t=' + inviteinfo_base64
  return link
}