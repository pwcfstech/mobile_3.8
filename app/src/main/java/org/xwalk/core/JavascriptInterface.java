package org.xwalk.core;

/**
 * Created by Ila.Pawar on 15-03-2016.
 */
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a method as being able to be exposed to JavaScript.  This is used for
 * safety purposes so that only explicitly marked methods get exposed instead
 * of every method in a class.
 * about the usage.
 */
@SuppressWarnings("javadoc")
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface JavascriptInterface {
}
