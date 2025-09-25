export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9\s]+$/.test(str);
}

export function checkPathFormat(str: string): boolean {
  return /^[a-zA-Z0-9_\-\/\.]+$/.test(str);
}

export function checkImageFormat(str: string): boolean {
  return /^[a-zA-Z0-9_\-\/\.]+:\/\/[a-zA-Z0-9_\-\/\.]+$/.test(str);
}

export function checkNetworkFormat(str: string): boolean {
  const network_regex = /^[A-Za-z0-9._-]+$/;
  const ip_regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  const mask_regex = /^(?:[0-9]|[12][0-9]|3[0-2])$/;
  const hostName_regex =
    /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9]))*$/;

  const sections = str.split(":");

  // If nothing is passed, the function returns false.
  if (sections.length === 0) return false;

  // Check the network part of the string.
  const network = sections[0];
  if (!network_regex.test(network)) return false;

  // If there is an IP address (and optionally a mask) provided, they are checked.
  if (sections.length >= 2) {
    const ip_and_mask = sections[1];
    const ip_sections = ip_and_mask.split("/");

    const ip = ip_sections[0];
    if (!ip_regex.test(ip)) return false;

    if (ip_sections.length > 1) {
      const mask = ip_sections[1];
      if (!mask_regex.test(mask)) return false;
    }
  }

  // If there is a gateway IP provided, it is checked.
  if (sections.length >= 3) {
    const gateway = sections[2];
    if (!ip_regex.test(gateway)) return false;
  }

  // If there is a dns0 IP provided, it is checked.
  if (sections.length >= 4) {
    const dns0 = sections[3];
    if (!ip_regex.test(dns0)) return false;
  }

  // If there is a dns1 IP provided, it is checked.
  if (sections.length >= 5) {
    const dns1 = sections[4];
    if (!ip_regex.test(dns1)) return false;
  }

  // If there is a hostname provided, it is checked.
  if (sections.length >= 6) {
    const hostname = sections[5];
    if (!hostName_regex.test(hostname)) return false;
  }

  // If there is a domain provided, it is checked.
  if (sections.length >= 7) {
    const domain = sections[6];
    if (!hostName_regex.test(domain)) return false;
  }

  return true;
}

export function checkPortNumberFormat(str: string): boolean {
    return /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-9]{1,4}))$/.test(str);
}

export function checkPortMappingFormat(str: string): boolean {
    const ports = str.split(":");
    if (ports.length !== 2) return false;

    const hostPort = ports[0];
    const uniKernelPort = ports[1];

    if (!checkPortNumberFormat(hostPort) || !checkPortNumberFormat(uniKernelPort)) return false;
    return true;
}

export function checkVolumeFormat(str: string): boolean {
    const paths = str.split(":");
    if (paths.length !== 2) return false;

    const hostPath = paths[0];
    const uniKernelPath = paths[1];

    if (!checkPathFormat(hostPath) || !checkPathFormat(uniKernelPath)) return false;
    return true;
}

export function checkTargetFormat(str: string): boolean {
    const allowedPlatforms = ["qemu", "xen", "firecracker"];
    const allowedArchitectures = ["x86_64", "arm64"];

    const parts = str.split("/");
    if (parts.length !== 2) return false;

    const platform = parts[0];
    const architecture = parts[1];

    if (!allowedPlatforms.includes(platform)) return false;
    if (!allowedArchitectures.includes(architecture)) return false;
    return true;
}

export function checkEnvironmentVariableFormat(str: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*(=.+)?$/.test(str);
}

export function checkMemoryFormat(str: string): boolean {
    return /^([1-9][0-9]*)([KMG]i?)$/.test(str);
}
