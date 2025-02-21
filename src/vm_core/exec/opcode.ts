// Enum Types for C0VM Instructions
const OpCode = {
    IADD : 0x60,
    IAND : 0x7e,
    IDIV : 0x6c,
    IMUL : 0x68,
    IOR : 0x80,
    IREM : 0x70,
    ISHL : 0x78,
    ISHR : 0x7a,
    ISUB : 0x64,
    IXOR : 0x82,
    DUP : 0x59,
    POP : 0x57,
    SWAP : 0x5f,
    NEWARRAY : 0xbc,
    ARRAYLENGTH : 0xbe,
    NEW : 0xbb,
    AADDF : 0x62,
    AADDS : 0x63,
    IMLOAD : 0x2e,
    AMLOAD : 0x2f,
    IMSTORE : 0x4e,
    AMSTORE : 0x4f,
    CMLOAD : 0x34,
    CMSTORE : 0x55,
    VLOAD : 0x15,
    VSTORE : 0x36,
    ACONST : 0x01,
    BIPUSH : 0x10,
    ILDC : 0x13,
    ALDC : 0x14,
    NOP : 0x00,
    IF_CMPEQ : 0x9f,
    IF_CMPNE : 0xa0,
    IF_ICMPLT : 0xa1,
    IF_ICMPGE : 0xa2,
    IF_ICMPGT : 0xa3,
    IF_ICMPLE : 0xa4,
    GOTO : 0xa7,
    ATHROW : 0xbf,
    ASSERT : 0xcf,
    INVOKESTATIC : 0xb8,
    INVOKENATIVE : 0xb7,
    RETURN : 0xb0,
    CHECKTAG: 0xc0,
    HASTAG : 0xc1,
    ADDTAG : 0xc2,
    ADDROF_STATIC: 0x16,
    ADDROF_NATIVE: 0x17,
    INVOKEDYNAMIC: 0xb6
}

export default OpCode;
