import { capitalize } from "./utils";

export function createEventListener(method: any) {
  const getParams = () => {
    let params: string[] = [];
    method.inputs.forEach((i: any) => {
      params.push(i.name);
    });
    return params.join(", ");
  };

  return `
export const use${capitalize(method.name)} = () => {
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    const listenTo${capitalize(method.name)} = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner() 
            const _contract = new ethers.Contract(address, abi, signer)
            _contract.on(${`${method.name}`}, (${getParams()}, event) => {
                setData(event)
            })
        } catch (error) {
            setError([error])
            return null
        }
    }

    return {
        listenTo${capitalize(method.name)},
        event${capitalize(method.name)}Data: data,
        event${capitalize(method.name)}Error: error
    }
}


`;
}
