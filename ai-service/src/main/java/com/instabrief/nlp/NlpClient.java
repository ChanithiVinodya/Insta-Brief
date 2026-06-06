package com.instabrief.nlp;

import java.util.List;

public interface NlpClient {

    String summarize(String content, int maxLength);

    List<String> extractKeywords(String content, int maxKeywords);
}
