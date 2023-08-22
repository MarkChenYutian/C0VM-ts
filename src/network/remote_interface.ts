function delay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

interface RetrieveInterfaceResult {error: string, interface: string};

async function retrieve_interface(content: File): Promise<RetrieveInterfaceResult> {
    await delay(1000);
    return {error: "", interface: "This is a placeholder interface"};
}

export default retrieve_interface
