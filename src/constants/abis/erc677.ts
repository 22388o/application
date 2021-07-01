import { Interface } from '@ethersproject/abi'
import ERC677_ABI from './erc677.json'
import ERC677_BYTES32_ABI from './erc677_bytes32.json'

const ERC677_INTERFACE = new Interface(ERC677_ABI)

const ERC677_BYTES32_INTERFACE = new Interface(ERC677_BYTES32_ABI)

export default ERC677_INTERFACE
export { ERC677_ABI, ERC677_BYTES32_INTERFACE, ERC677_BYTES32_ABI }
