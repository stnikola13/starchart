/**
 * Checks if the given string is alphanumeric (contains only letters, numbers, and blank spaces).
 *
 * @param str - The string that is checked.
 * @returns Boolean value indicating whether the string is alphanumeric.
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9\s]+$/.test(str);
}

/**
 * Checks if the given path string is valid (contains only letters, numbers, underscores, hyphens, marks, and dots).
 *
 * @param str - The path string that is checked.
 * @returns Boolean value indicating whether the string is correctly formatted.
 */
export function checkPathFormat(str: string): boolean {
  return /^[a-zA-Z0-9_\-\/\.]+$/.test(str);
}

/**
 * Checks if the given image string is valid. A valid image string comprises two parts, separated by a colon.
 * Each part contains only letters, numbers, underscores, hyphens, marks, and dots.
 *
 * @param str - The image string that is checked.
 * @returns Boolean value indicating whether the string is correctly formatted.
 */
export function checkImageFormat(str: string): boolean {
  return /^[a-zA-Z0-9_\-\/\.]+:\/\/[a-zA-Z0-9_\-\/\.]+$/.test(str);
}

/**
 * Checks if the given network string is properly formatted. The format is:
 * <network>[:ip[/mask][:gw[:dns0[:dns1[:hostname[:domain]]]]]].
 *
 * @param str - The network string that is checked.
 * @returns Boolean value indicating whether the string is correctly formatted.
 */
export function checkNetworkFormat(str: string): boolean {
  // Network regex checks for alphanumeric characters, dots, underscores, and hyphens.
  // IP regex checks for valid IPv4 addresses.
  // Mask regex checks for numbers between 0 and 32.
  // Hostname regex checks for valid hostnames.
  const network_regex = /^[A-Za-z0-9._-]+$/;
  const ip_regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  const mask_regex = /^(?:[0-9]|[12][0-9]|3[0-2])$/;
  const hostName_regex =
    /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9]))*$/;

  const sections = str.split(":");

  // If nothing is passed, the function returns false.
  if (sections.length === 0) return false;

  // Check the network part of the string (it must exist).
  const network = sections[0];
  if (!network_regex.test(network)) return false;

  // If there is an IP address (and optionally a mask) provided, they are checked. They are separated by a '/'.
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

  // If there is a gateway IP address provided, it is checked.
  if (sections.length >= 3) {
    const gateway = sections[2];
    if (!ip_regex.test(gateway)) return false;
  }

  // If there is a dns0 IP address provided, it is checked.
  if (sections.length >= 4) {
    const dns0 = sections[3];
    if (!ip_regex.test(dns0)) return false;
  }

  // If there is a dns1 IP address provided, it is checked.
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

/**
 * Checks if the given port string is a valid port.
 *
 * @param str - The port string that is checked.
 * @returns Boolean value indicating whether the port string is valid.
 */
export function checkPortNumberFormat(str: string): boolean {
  return /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-9]{1,4}))$/.test(str);
}

/**
 * Checks if the given port mapping string is properly formatted (hostPort:unikernelPort).
 *
 * @param str - The port mapping string that is checked.
 * @returns Boolean value indicating whether the port mapping string is valid.
 */
export function checkPortMappingFormat(str: string): boolean {
  const ports = str.split(":");
  if (ports.length !== 2) return false;

  const hostPort = ports[0];
  const uniKernelPort = ports[1];

  if (!checkPortNumberFormat(hostPort) || !checkPortNumberFormat(uniKernelPort))
    return false;
  return true;
}

/**
 * Checks if the given volume string is properly formatted (hostPath:unikernelPath).
 *
 * @param str - The volume string that is checked.
 * @returns Boolean value indicating whether the volume string is valid.
 */
export function checkVolumeFormat(str: string): boolean {
  const paths = str.split(":");
  if (paths.length !== 2) return false;

  const hostPath = paths[0];
  const uniKernelPath = paths[1];

  if (!checkPathFormat(hostPath) || !checkPathFormat(uniKernelPath))
    return false;
  return true;
}

/**
 * Checks if the given target string is properly formatted (platform/architecture).
 * Allowed platforms: qemu, xen, firecracker. Allowed architectures: x86_64, arm64.
 *
 * @param str - The target string that is checked.
 * @returns Boolean value indicating whether the target string is valid.
 */
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

/**
 * Checks if the environment variable string is properly formatted (key[=value]). The key has to start with a lowercase letter or underscore.
 *
 * @param str - The string that is checked.
 * @returns Boolean value indicating whether the environment variable string is properly formatted.
 */
export function checkEnvironmentVariableFormat(str: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*(=.+)?$/.test(str);
}

/**
 * Checks if the memory string is properly formatted. It begins with a non-zero digit, followed by optional digits, and ends with a unit (K, M, G, Ki, Mi, Gi).
 *
 * @param str - The string that is checked.
 * @returns Boolean value indicating whether the memory string is properly formatted.
 */
export function checkMemoryFormat(str: string): boolean {
  return /^([1-9][0-9]*)([KMG]i?)$/.test(str);
}
