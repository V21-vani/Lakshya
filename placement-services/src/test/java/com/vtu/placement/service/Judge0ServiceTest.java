package com.vtu.placement.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class Judge0ServiceTest {

    @Test
    void normaliseIgnoresWindowsLineEndingsAndTrailingWhitespace() {
        assertEquals(Judge0Service.normalise("5\n"), Judge0Service.normalise("5\r\n"));
        assertEquals("1 2\n3", Judge0Service.normalise("1 2   \n3\n\n"));
        assertEquals("", Judge0Service.normalise(null));
    }
}
